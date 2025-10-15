import { attendanceChecker } from './attendance-checker';

export class AttendanceScheduler {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the daily attendance check scheduler
   */
  startDailyCheck(): void {
    if (this.isRunning) {
      console.log('⚠️ Attendance scheduler is already running');
      return;
    }

    console.log('🚀 Starting daily attendance check scheduler...');
    this.isRunning = true;

    // Run immediately on start (for testing)
    this.runAttendanceCheck();

    // Schedule to run every day at 6 PM
    this.intervalId = setInterval(() => {
      this.runAttendanceCheck();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('✅ Daily attendance check scheduler started (runs at 6 PM daily)');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Attendance scheduler stopped');
  }

  /**
   * Run attendance check manually
   */
  async runAttendanceCheck(): Promise<void> {
    try {
      console.log('🔍 Running scheduled attendance check...');
      await attendanceChecker.checkAllStudentsAttendance();
      console.log('✅ Scheduled attendance check completed');
    } catch (error) {
      console.error('❌ Error in scheduled attendance check:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; nextRun?: Date } {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning ? this.getNextRunTime() : undefined
    };
  }

  /**
   * Calculate next run time (6 PM today or tomorrow)
   */
  private getNextRunTime(): Date {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(18, 0, 0, 0); // 6 PM

    // If it's already past 6 PM today, schedule for tomorrow
    if (now.getTime() > nextRun.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  }
}

// Export singleton instance
export const attendanceScheduler = new AttendanceScheduler();
