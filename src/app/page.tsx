import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpenCheck, QrCode, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.png"
              alt="App Logo"
              fill
              className="rounded-full ring-2 ring-primary shadow object-cover bg-white"
              sizes="40px"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-headline">Smart Student Monitoring</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-6 relative h-24 w-24">
              <Image
                src="/logo.png"
                alt="App Logo"
                fill
                className="rounded-full ring-4 ring-primary shadow-xl object-cover bg-white"
                sizes="96px"
                priority
              />
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline bg-gradient-to-b from-foreground to-foreground/70 text-transparent bg-clip-text">
              Revolutionizing Classroom Attendance
            </h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              A seamless, efficient, and intelligent system for lecturers and students to manage attendance effortlessly.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Get Started For Free</Link>
            </Button>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold font-headline">Features</h3>
              <p className="text-muted-foreground">Everything you need for modern attendance tracking.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-accent/20 p-4 rounded-full">
                    <QrCode className="h-10 w-10 text-accent-foreground" />
                  </div>
                  <h4 className="text-xl font-semibold font-headline">QR Code Sessions</h4>
                  <p className="text-muted-foreground">
                    Lecturers can generate unique, time-sensitive QR codes for each attendance session.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center p-8 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-primary/20 p-4 rounded-full">
                    <BookOpenCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold font-headline">Real-time Tracking</h4>
                  <p className="text-muted-foreground">
                    Students can mark their attendance instantly, and lecturers see live updates.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center p-8 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-secondary p-4 rounded-full">
                     <Users className="h-10 w-10 text-secondary-foreground" />
                  </div>
                  <h4 className="text-xl font-semibold font-headline">Insightful Reports</h4>
                  <p className="text-muted-foreground">
                    Generate and view detailed attendance reports to monitor student engagement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Smart Student Monitoring System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
