export class Logger {
  static info(message: string, context?: any) {
    if (context) {
      console.log(`[INFO] ${message}`, JSON.stringify(context, null, 2));
    } else {
      console.log(`[INFO] ${message}`);
    }
  }

  static error(message: string, error?: any) {
    if (error) {
      console.error(`[ERROR] ${message}`, error.message || error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }

  static warn(message: string, context?: any) {
    if (context) {
      console.warn(`[WARN] ${message}`, JSON.stringify(context, null, 2));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }
}
