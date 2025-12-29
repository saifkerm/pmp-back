export class DateUtil {
    static addDays(date: Date, days: number): Date {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
  
    static addHours(date: Date, hours: number): Date {
      const result = new Date(date);
      result.setHours(result.getHours() + hours);
      return result;
    }
  
    static isExpired(date: Date): boolean {
      return date < new Date();
    }
  
    static formatDate(date: Date): string {
      return date.toISOString();
    }
  }