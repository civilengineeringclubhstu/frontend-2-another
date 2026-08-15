'use client';
import { PageHeader } from '@/components/page-header';
import { MemberCard } from '@/components/member-card';
import { useEffect, useState } from 'react';
import { getAllLeadershipMembers } from '@/lib/db';
import Link from 'next/link';

export default function AlumniPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllLeadershipMembers('alumni');
      setMembers(data);
      setLoading(false);
    }
    load();
  }, []);

  // Group members by batch
  const groupedAlumni = members.reduce((acc, member) => {
    const batch = member.batch || 'Unknown Batch';
    if (!acc[batch]) acc[batch] = [];
    acc[batch].push(member);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort batches (latest first)
  const sortedBatches = Object.keys(groupedAlumni).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA;
    }
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return b.localeCompare(a); // Fallback to descending alphabetical
  });

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Our Alumni" 
        description="Celebrating the legacy and achievements of our past members."
      />
      
      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {['executive', 'alumni', 'advisory', 'taskforce'].map((tab) => (
          <Link 
            key={tab} 
            href={`/about/leadership/${tab}`}
            className={`px-6 py-2 rounded-full font-medium transition-all ${tab === 'alumni' ? 'bg-info-light text-white shadow-lg' : 'glass hover:bg-white/80 dark:hover:bg-white/10'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </div>
      
      {loading && <div className="text-center py-10">Loading members...</div>}
      {!loading && sortedBatches.length === 0 && <div className="text-center py-10 text-primary-light/60 dark:text-primary/60">No members found in this category.</div>}
      
      <div className="flex flex-col gap-16">
        {!loading && sortedBatches.map(batch => (
          <div key={batch} className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold border-b border-black/10 dark:border-white/10 pb-2">
              Batch {batch !== 'Unknown Batch' ? batch : ''}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" style={{ perspective: 1000 }}>
              {groupedAlumni[batch].map((member: any, idx: number) => (
                <MemberCard 
                  key={member.id || idx}
                  index={idx}
                  name={member.name}
                  designation={member.designation}
                  batch={member.batch}
                  photoUrl={member.photoUrl || `https://picsum.photos/seed/p${idx}/400/400`}
                  facebookUrl={member.facebookUrl || "#"}
                  linkedinUrl={member.linkedinUrl || "#"}
                  email={member.email || ""}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
