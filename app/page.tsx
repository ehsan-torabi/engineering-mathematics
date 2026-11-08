'use client';

import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import CourseHome from '@/components/home/CourseHome';

export default function EngineeringMathHomePage() {
  return (
    <AppChrome>
      <AppShell>
        <CourseHome />
      </AppShell>
    </AppChrome>
  );
}
