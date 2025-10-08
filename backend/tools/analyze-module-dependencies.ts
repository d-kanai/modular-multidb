import * as fs from 'fs';
import * as path from 'path';

interface ApiDependency {
  api: string;
  dependedBy: string[];
}

interface EventDependency {
  event: string;
  publishers?: string[];
  subscribers?: string[];
}

interface ModuleDependencies {
  module: string;
  api?: ApiDependency[];
  event?: EventDependency[];
}

class ModuleDependencyAnalyzer {
  private modulesDir: string;
  private dependencies: Map<string, ModuleDependencies> = new Map();

  constructor(modulesDir: string = path.join(process.cwd(), '..', 'modules')) {
    this.modulesDir = modulesDir;
  }

  analyze(): ModuleDependencies[] {
    const modules = this.getModules();

    // Initialize all modules
    for (const module of modules) {
      this.dependencies.set(module, { module, api: [], event: [] });
    }

    // Analyze API dependencies
    for (const module of modules) {
      this.analyzeApiDependencies(module);
      this.analyzeEventDependencies(module);
    }

    return Array.from(this.dependencies.values());
  }

  private getModules(): string[] {
    if (!fs.existsSync(this.modulesDir)) {
      return [];
    }

    return fs.readdirSync(this.modulesDir)
      .filter(file => {
        const fullPath = path.join(this.modulesDir, file);
        return fs.statSync(fullPath).isDirectory();
      });
  }

  private analyzeApiDependencies(consumerModule: string): void {
    // Check for generated API clients (indicates this module depends on other APIs)
    const generatedPath = path.join(
      this.modulesDir,
      consumerModule,
      'src/infrastructure/external/generated'
    );

    if (!fs.existsSync(generatedPath)) {
      return;
    }

    const apiDirs = fs.readdirSync(generatedPath);

    for (const apiDir of apiDirs) {
      // Extract provider module name from directory (e.g., "user-api" -> "user")
      const providerModule = apiDir.replace('-api', '');

      // Find which commands/queries use this API
      const usages = this.findApiUsages(consumerModule, apiDir);

      // Add to provider module's API dependencies
      const providerDeps = this.dependencies.get(providerModule);
      if (providerDeps) {
        for (const usage of usages) {
          const existingApi = providerDeps.api?.find(a => a.api === usage.apiName);
          if (existingApi) {
            if (!existingApi.dependedBy.includes(usage.usedBy)) {
              existingApi.dependedBy.push(usage.usedBy);
            }
          } else {
            providerDeps.api?.push({
              api: usage.apiName,
              dependedBy: [usage.usedBy]
            });
          }
        }
      }
    }
  }

  private findApiUsages(consumerModule: string, apiDir: string): Array<{ apiName: string; usedBy: string }> {
    const usages: Array<{ apiName: string; usedBy: string }> = [];

    // Find the wrapper client (e.g., UserApiClient)
    const clientPath = path.join(
      this.modulesDir,
      consumerModule,
      'src/infrastructure/external'
    );

    if (!fs.existsSync(clientPath)) {
      return usages;
    }

    const clientFiles = fs.readdirSync(clientPath).filter(f =>
      f.endsWith('.client.ts') && !f.includes('generated')
    );

    // Extract API methods from client wrapper
    const clientApis: Map<string, string> = new Map(); // method -> clientClass

    for (const clientFile of clientFiles) {
      const fullPath = path.join(clientPath, clientFile);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check if this client uses the generated SDK
      if (content.includes(`from './generated/${apiDir}`)) {
        // Extract class name and methods
        const classMatch = content.match(/export class (\w+)/);
        if (classMatch) {
          const className = classMatch[1];

          // Find async methods (APIs)
          const methodMatches = content.matchAll(/async (\w+)\(/g);
          for (const match of methodMatches) {
            clientApis.set(match[1], className);
          }
        }
      }
    }

    // Find where these client methods are used in application layer
    const appPath = path.join(this.modulesDir, consumerModule, 'src/application');

    if (fs.existsSync(appPath)) {
      this.findClientUsagesInDirectory(appPath, clientApis, consumerModule, usages);
    }

    return usages;
  }

  private findClientUsagesInDirectory(
    dir: string,
    clientApis: Map<string, string>,
    consumerModule: string,
    usages: Array<{ apiName: string; usedBy: string }>
  ): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.findClientUsagesInDirectory(fullPath, clientApis, consumerModule, usages);
      } else if (file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Check which client APIs are used
        for (const [method, clientClass] of clientApis.entries()) {
          // Look for pattern: this.clientInstance.method( or await this.client.method(
          const usagePattern = new RegExp(`\\.(\\w+)\\.${method}\\(`);
          if (usagePattern.test(content)) {
            // Extract UseCase class name
            const classMatch = content.match(/export class (\w+)/);
            if (classMatch) {
              const className = classMatch[1];
              usages.push({
                apiName: method,
                usedBy: `${consumerModule}.${className}`
              });
            }
          }
        }
      }
    }
  }

  private analyzeEventDependencies(module: string): void {
    // Analyze event publishers (domain events)
    this.analyzeEventPublishers(module);

    // Analyze event subscribers
    this.analyzeEventSubscribers(module);
  }

  private analyzeEventPublishers(module: string): void {
    const domainPath = path.join(this.modulesDir, module, 'src/domain/entities');

    if (!fs.existsSync(domainPath)) {
      return;
    }

    const files = fs.readdirSync(domainPath);

    for (const file of files) {
      if (!file.endsWith('.ts')) continue;

      const filePath = path.join(domainPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Look for domain event creation patterns
      const eventMatches = content.matchAll(/(\w+Event)\(/g);

      for (const match of eventMatches) {
        const eventName = match[1];
        const classMatch = content.match(/class (\w+)/);

        if (classMatch) {
          const className = classMatch[1];
          const moduleDeps = this.dependencies.get(module);

          if (moduleDeps) {
            const existingEvent = moduleDeps.event?.find(e => e.event === eventName);
            const publisher = `${className}`;

            if (existingEvent) {
              if (!existingEvent.publishers) {
                existingEvent.publishers = [];
              }
              if (!existingEvent.publishers.includes(publisher)) {
                existingEvent.publishers.push(publisher);
              }
            } else {
              moduleDeps.event?.push({
                event: eventName,
                publishers: [publisher]
              });
            }
          }
        }
      }
    }
  }

  private analyzeEventSubscribers(module: string): void {
    const eventsPath = path.join(this.modulesDir, module, 'src/infrastructure/events');

    if (!fs.existsSync(eventsPath)) {
      return;
    }

    const files = fs.readdirSync(eventsPath);

    for (const file of files) {
      if (!file.endsWith('.ts') || file.includes('.gen.')) continue;

      const filePath = path.join(eventsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Look for event subscription patterns (listening to other modules' events)
      // Pattern: listening to "module.eventName"
      const subscriptionMatches = content.matchAll(/['"](\w+)\.(\w+)['"]/g);

      for (const match of subscriptionMatches) {
        const [, sourceModule, eventName] = match;

        // Add to source module's event dependencies
        const sourceDeps = this.dependencies.get(sourceModule);
        if (sourceDeps) {
          const existingEvent = sourceDeps.event?.find(e => e.event === eventName);
          const subscriber = `${module}`;

          if (existingEvent) {
            if (!existingEvent.subscribers) {
              existingEvent.subscribers = [];
            }
            if (!existingEvent.subscribers.includes(subscriber)) {
              existingEvent.subscribers.push(subscriber);
            }
          } else {
            sourceDeps.event?.push({
              event: eventName,
              subscribers: [subscriber]
            });
          }
        }
      }
    }
  }

  formatOutput(dependencies: ModuleDependencies[]): string {
    let output = '';

    for (const moduleDep of dependencies) {
      output += `${moduleDep.module}\n`;

      // API dependencies
      if (moduleDep.api && moduleDep.api.length > 0) {
        output += '- api\n';
        for (const api of moduleDep.api) {
          const dependents = api.dependedBy.join(', ');
          output += `  - ${api.api} API depended by ${dependents}\n`;
        }
      }

      // Event dependencies
      if (moduleDep.event && moduleDep.event.length > 0) {
        output += '- event\n';
        for (const event of moduleDep.event) {
          if (event.publishers && event.publishers.length > 0) {
            output += `  - publish ${event.publishers.join(', ')} -> ${event.event}\n`;
          }
          if (event.subscribers && event.subscribers.length > 0) {
            output += `  - subscribe ${event.event} by ${event.subscribers.join(', ')}\n`;
          }
        }
      }

      output += '\n';
    }

    return output;
  }
}

// Run the analyzer
const analyzer = new ModuleDependencyAnalyzer();
const dependencies = analyzer.analyze();
const output = analyzer.formatOutput(dependencies);

console.log(output);
