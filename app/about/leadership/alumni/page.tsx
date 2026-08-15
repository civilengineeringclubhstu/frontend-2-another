'use client';
import { PageHeader } from '@/components/page-header';
import { MemberCard } from '@/components/member-card';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllLeadershipMembers } from '@/lib/db';
import Link from 'next/link';
import { Filter, Check } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function AlumniPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const data = await getAllLeadershipMembers('alumni');
      setMembers(data);
      setLoading(false);
    }
    load();
  }, []);

  // Close the filter dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // All unique batches, sorted (latest first)
  const allBatches = useMemo(() => {
    const batchSet = new Set<string>();
    members.forEach((m) => batchSet.add(m.batch || 'Unknown Batch'));
    return Array.from(batchSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return b.localeCompare(a);
    });
  }, [members]);

  // Apply batch filter
  const filteredMembers = useMemo(() => {
    if (selectedBatch === 'all') return members;
    return members.filter((m) => (m.batch || 'Unknown Batch') === selectedBatch);
  }, [members, selectedBatch]);

  // Reset to page 1 whenever the filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBatch]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);

  // Group the current page's members by batch, preserving order
  const groupedAlumni = useMemo(() => {
    return paginatedMembers.reduce((acc, member) => {
      const batch = member.batch || 'Unknown Batch';
      if (!acc[batch]) acc[batch] = [];
      acc[batch].push(member);
      return acc;
    }, {} as Record<string, any[]>);
  }, [paginatedMembers]);

  const sortedBatches = useMemo(() => {
    return Object.keys(groupedAlumni).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return b.localeCompare(a);
    });
  }, [groupedAlumni]);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Build a simple page number list with ellipses for large ranges
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader
        title="Our Alumni"
        description="Celebrating the legacy and achievements of our past members."
      />

      {/* Category Navigation Tabs + Filter Icon */}
      <div className="relative flex flex-wrap items-center justify-center gap-4 mb-12">
        {['executive', 'alumni', 'advisory', 'taskforce'].map((tab) => (
          <Link
            key={tab}
            href={`/about/leadership/${tab}`}
            className={`px-6 py-2 rounded-full font-medium transition-all ${tab === 'alumni' ? 'bg-info-light text-white shadow-lg' : 'glass hover:bg-white/80 dark:hover:bg-white/10'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        ))}

        {/* Filter icon, pinned to the right */}
        {!loading && allBatches.length > 0 && (
          <div ref={filterRef} className="absolute right-0 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              aria-label="Filter by batch"
              className={`relative w-11 h-11 flex items-center justify-center rounded-full transition-all ${selectedBatch !== 'all' ? 'bg-info-light text-white shadow-lg' : 'glass hover:bg-white/80 dark:hover:bg-white/10'}`}
            >
              <Filter size={18} />
              {selectedBatch !== 'all' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-black" />
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl glass shadow-xl p-2 z-20">
                <button
                  onClick={() => {
                    setSelectedBatch('all');
                    setFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                >
                  All Batches
                  {selectedBatch === 'all' && <Check size={16} />}
                </button>
                {allBatches.map((batch) => (
                  <button
                    key={batch}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                  >
                    {batch !== 'Unknown Batch' ? `Batch ${batch}` : 'Unknown Batch'}
                    {selectedBatch === batch && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <div className="text-center py-10">Loading members...</div>}
      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-10 text-primary-light/60 dark:text-primary/60">
          No members found in this category.
        </div>
      )}

      <div className="flex flex-col gap-16">
        {!loading &&
          sortedBatches.map((batch) => (
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full font-medium glass hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>

          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-primary-light/60 dark:text-primary/60">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                className={`w-10 h-10 rounded-full font-medium transition-all ${currentPage === page ? 'bg-info-light text-white shadow-md' : 'glass hover:bg-white/80 dark:hover:bg-white/10'}`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full font-medium glass hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}