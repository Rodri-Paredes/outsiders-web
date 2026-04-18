'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ProfileContent = dynamic(() => import('./ProfileContent'), { ssr: false });

export default function ProfilePage() {
  return <ProfileContent />;
}
