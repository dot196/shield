import { type RegistryOptions, type PolymorphicOptions } from "@shared/schema";
import crypto from "crypto";

interface VersionInfo {
  companyName: string;
  productName: string;
  fileDescription: string;
  fileVersion: string;
  productVersion: string;
  legalCopyright: string;
  legalTrademarks?: string;
}

export class BinaryProcessor {
  private buffer: Buffer;
  private originalChecksum: string;
  private antiDebugCode: Buffer;
  private metamorphicCodeCache: Set<string>;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.originalChecksum = this.calculateChecksum(buffer);
    this.antiDebugCode = this.generateAntiDebugCode();
    this.metamorphicCodeCache = new Set();
  }

  private calculateChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private generateAntiDebugCode(): Buffer {
    const patterns = [
      'IsDebuggerPresent',
      'CheckRemoteDebuggerPresent',
      'NtQueryInformationProcess',
      'QueryPerformanceCounter',
      'GetTickCount',
      'OutputDebugString',
      'CloseHandle'
    ];
    return Buffer.from(patterns.join(';'));
  }

  public verifyIntegrity(): boolean {
    return this.calculateChecksum(this.buffer) === this.originalChecksum;
  }

  public setVersionInfo(info: VersionInfo): void {
    return;
  }

  public setIcon(iconBuffer: Buffer): void {
    return;
  }

  private generateJunkFunctions(): string[] {
    const functionTemplates = [
      'function ${name}() { try { return ${expr}; } catch { return ${fallback}; } }',
      'async function ${name}() { await new Promise(r => setTimeout(r, ${timeout})); return ${expr}; }',
      'function ${name}(x) { return x ? ${expr1} : ${expr2}; }',
      'const ${name} = () => { console.log("${log}"); return ${expr}; }',
      'function ${name}() { while(${condition}) { if(${check}) break; } }'
    ];

    const names = ['process', 'verify', 'check', 'validate', 'compute', 'calculate'];
    const expressions = ['Math.random() * 1000', 'Date.now()', 'new Error("Invalid operation")', 'undefined'];

    return functionTemplates.map(template => {
      const name = names[Math.floor(Math.random() * names.length)];
      const expr = expressions[Math.floor(Math.random() * expressions.length)];
      return template
        .replace('${name}', name)
        .replace('${expr}', expr)
        .replace('${fallback}', 'null')
        .replace('${timeout}', Math.floor(Math.random() * 1000).toString())
        .replace('${expr1}', 'true')
        .replace('${expr2}', 'false')
        .replace('${log}', 'Validation check')
        .replace('${condition}', 'true')
        .replace('${check}', 'Math.random() > 0.5');
    });
  }

  private generateMetamorphicCode(): string {
    const templates = [
      'class ${className} { constructor() { this.${prop} = ${value}; } ${method}() { return this.${prop}; } }',
      '(() => { let ${var} = ${value}; return () => { ${var} = ${transform}; return ${var}; }; })();',
      'new Proxy({${prop}: ${value}}, { get: (t,p) => t[p] ?? (() => Math.random() > 0.5 ? ${value1} : ${value2}) });'
    ];

    const names = crypto.randomBytes(8).toString('hex').match(/.{1,4}/g) || [];
    const values = [Date.now(), Math.random() * 1000, `"${crypto.randomBytes(16).toString('hex')}"`];

    let code;
    do {
      const template = templates[Math.floor(Math.random() * templates.length)];
      code = template
        .replace('${className}', `C${names[0]}`)
        .replace('${prop}', `p${names[1]}`)
        .replace('${method}', `m${names[2]}`)
        .replace('${var}', `v${names[3]}`)
        .replace(/\${value}/g, values[Math.floor(Math.random() * values.length)].toString())
        .replace('${transform}', `${names[0]} * ${Math.random() * 10}`)
        .replace('${value1}', values[1].toString())
        .replace('${value2}', values[2].toString());
    } while (this.metamorphicCodeCache.has(code));

    this.metamorphicCodeCache.add(code);
    return code;
  }

  private generatePolymorphicAntiDebug(options: PolymorphicOptions): Buffer {
    const patterns = [
      `(function(){try{document.createElement('canvas').getContext('webgl')}catch(e){return true}})()`,
      `(function(){return window.outerHeight-window.innerHeight>200})()`,
      `(function(){return /HeadlessChrome/.test(window.navigator.userAgent)})()`,
      `(function(){return window.callPhantom||window._phantom||window.phantom})()`,
      `(function(){return window.__nightmare})()`,
      `(function(){return window.Buffer!==undefined})()`,
      `(function(){return window.process?.type==='renderer'})()`,
    ];

    const randomPatterns = patterns
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * patterns.length) + 1);

    if (options.dynamicAntiDebugging) {
      randomPatterns.push(this.generateMetamorphicCode());
    }

    return Buffer.from(randomPatterns.join(';'));
  }

  public applyPolymorphicObfuscation(options: PolymorphicOptions): void {
    const metamorphicCode = Array.from({ length: 5 }, () => this.generateMetamorphicCode()).join('\n');
    const antiDebugChecks = this.generatePolymorphicAntiDebug(options);
    const instanceId = crypto.randomBytes(16).toString('hex');
    const metamorphicMarker = Buffer.from(`DLINQNT_POLY_${instanceId}`);

    this.buffer = Buffer.concat([
      this.buffer,
      metamorphicMarker,
      Buffer.from(metamorphicCode),
      antiDebugChecks,
      Buffer.from(crypto.randomBytes(Math.floor(Math.random() * 1024)))
    ]);
  }

  public pumpFileSize(targetSizeMB: number): void {
    const currentSizeBytes = this.buffer.length;
    const targetSizeBytes = targetSizeMB * 1024 * 1024;

    if (targetSizeBytes <= currentSizeBytes) {
      return;
    }

    const bytesToAdd = targetSizeBytes - currentSizeBytes;
    const marker = Buffer.from('DLINQNT_PUMP_DATA');
    const junkFunctions = this.generateJunkFunctions();
    const junkCode = junkFunctions.join('\n\n');
    const antiDebugChecks = this.antiDebugCode;

    const randomData = Buffer.alloc(bytesToAdd - marker.length - junkCode.length - antiDebugChecks.length);
    let position = 0;
    while (position < randomData.length) {
      const pattern = junkFunctions[Math.floor(Math.random() * junkFunctions.length)];
      const patternBuffer = Buffer.from(pattern);

      if (position + patternBuffer.length <= randomData.length) {
        patternBuffer.copy(randomData, position);
        position += patternBuffer.length;
      } else {
        break;
      }
    }
    crypto.randomFillSync(randomData, position);

    this.buffer = Buffer.concat([
      this.buffer,
      marker,
      Buffer.from(junkCode),
      antiDebugChecks,
      randomData
    ]);
  }

  public getBuffer(): Buffer {
    if (!this.verifyIntegrity()) {
      throw new Error("File integrity check failed");
    }
    return this.buffer;
  }

  public static fromRegistry(registry: RegistryOptions): VersionInfo {
    return {
      companyName: registry.companyName,
      productName: registry.productName,
      fileDescription: registry.description,
      fileVersion: registry.version,
      productVersion: registry.version,
      legalCopyright: registry.copyright,
      legalTrademarks: registry.trademarks
    };
  }
}