import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

export interface BlogPost {
  id: string;
  slug?: string;
  title: string;
  coverImageUrl?: string;
  imageUrl?: string;
  contentMarkdown?: string;
  bodyRichText?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  readTimeMinutes?: number;
  tags?: string[];
  author?: string;
  authorName?: string;
  createdAt?: any;
  publishedAt?: any;
  status?: string;
  [key: string]: any;
}

export function normalizeBlog(docId: string, raw: any): BlogPost {
  const data = raw || {};
  const contentText = data.bodyRichText || data.contentMarkdown || data.content || data.body || data.description || '';
  const dateVal = data.publishedAt || data.createdAt || data.date || (data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : null);
  const cover = data.coverImageUrl || data.imageUrl || data.image || data.coverImage || data.thumbnail || '';
  
  return {
    id: docId,
    ...data,
    slug: data.slug || docId,
    title: data.title || 'Untitled Post',
    coverImageUrl: cover,
    imageUrl: cover,
    contentMarkdown: contentText,
    bodyRichText: contentText,
    content: contentText,
    description: contentText,
    excerpt: data.excerpt || data.summary || (typeof contentText === 'string' ? contentText.replace(/<[^>]+>/g, '').substring(0, 180) : ''),
    readTimeMinutes: data.readTimeMinutes || data.readTime || 3,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author || data.authorName || 'CE Club',
    createdAt: dateVal,
    publishedAt: dateVal,
    status: data.status || 'published',
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  if (!db) return [];
  const collectionsToTry = ['blog', 'blogs', 'posts', 'articles'];
  const allPostsMap = new Map<string, BlogPost>();

  for (const colName of collectionsToTry) {
    try {
      let snap;
      try {
        const q = query(collection(db, colName), orderBy('createdAt', 'desc'));
        snap = await getDocs(q);
      } catch {
        snap = await getDocs(collection(db, colName));
      }

      if (snap && !snap.empty) {
        snap.docs.forEach((d) => {
          const raw = d.data();
          const normalized = normalizeBlog(d.id, raw);
          // Only show published or items with no explicit non-published status
          if (normalized.status !== 'draft' && normalized.status !== 'archived') {
            allPostsMap.set(d.id, normalized);
          }
        });
      }
    } catch (e) {
      console.warn(`Querying collection ${colName} failed:`, e);
    }
  }

  const posts = Array.from(allPostsMap.values());
  // Sort descending by date
  posts.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return posts;
}

export async function getLatestBlogs(count = 3): Promise<BlogPost[]> {
  const all = await getAllBlogs();
  return all.slice(0, count);
}

export async function getBlogById(idOrSlug: string): Promise<BlogPost | null> {
  if (!db || !idOrSlug) return null;
  const cleanKey = decodeURIComponent(idOrSlug).trim();
  const collectionsToTry = ['blog', 'blogs', 'posts', 'articles'];

  for (const colName of collectionsToTry) {
    try {
      // 1. Try finding by document ID
      const byDocIdQuery = query(collection(db, colName), where('__name__', '==', cleanKey));
      let snap = await getDocs(byDocIdQuery);

      // 2. Try finding by slug
      if (snap.empty) {
        const bySlugQuery = query(collection(db, colName), where('slug', '==', cleanKey));
        snap = await getDocs(bySlugQuery);
      }

      // 3. Try finding by id field
      if (snap.empty) {
        const byIdQuery = query(collection(db, colName), where('id', '==', cleanKey));
        snap = await getDocs(byIdQuery);
      }

      if (!snap.empty) {
        const d = snap.docs[0];
        return normalizeBlog(d.id, d.data());
      }
    } catch (e) {
      console.warn(`Error finding blog in ${colName}:`, e);
    }
  }

  // Fallback: search all in memory in case the key matches slug or id
  const all = await getAllBlogs();
  const found = all.find((p) => p.id === cleanKey || p.slug === cleanKey);
  return found || null;
}

export interface EventItem {
  id: string;
  title: string;
  descriptionMarkdown: string;
  description?: string;
  contentMarkdown?: string;
  bodyRichText?: string;
  location: string;
  coverImageUrl: string;
  imageUrl?: string;
  eventDate: string;
  time?: string;
  googleFormUrl?: string;
  registrationUrl?: string;
  facebookUrl?: string;
  status?: string;
  [key: string]: any;
}

export function normalizeEvent(docId: string, raw: any): EventItem {
  const data = raw || {};
  const desc = data.descriptionMarkdown || data.description || data.contentMarkdown || data.bodyRichText || data.content || '';
  const cover = data.coverImageUrl || data.imageUrl || data.image || data.coverImage || data.thumbnail || 'https://picsum.photos/seed/event_' + docId + '/800/450';
  const rawDate = data.eventDate || data.date || data.startDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '');

  return {
    id: docId,
    ...data,
    title: data.title || 'Untitled Event',
    descriptionMarkdown: desc,
    description: desc,
    location: data.location || data.venue || 'HSTU Campus / TBA',
    coverImageUrl: cover,
    imageUrl: cover,
    eventDate: rawDate || new Date().toISOString().split('T')[0],
    time: data.time || data.eventTime || data.startTime || 'TBA',
    googleFormUrl: data.googleFormUrl || data.registrationUrl || data.formUrl || data.ticketUrl || '',
    facebookUrl: data.facebookUrl || data.galleryUrl || data.link || '',
    status: data.status || 'published',
  };
}

export async function getUpcomingEvents(count = 20): Promise<EventItem[]> {
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  const collectionsToTry = ['event_logs', 'events', 'upcoming_events'];
  const eventMap = new Map<string, EventItem>();

  for (const colName of collectionsToTry) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const item = normalizeEvent(doc.id, doc.data());
          if (item.status !== 'draft' && item.status !== 'archived') {
            if (item.eventDate >= today || !item.eventDate) {
              eventMap.set(doc.id, item);
            }
          }
        });
      }
    } catch (e) {
      console.warn(`Querying upcoming events from ${colName} failed:`, e);
    }
  }

  const events = Array.from(eventMap.values());
  // Sort ascending by event date (soonest first)
  events.sort((a, b) => {
    return (a.eventDate || '').localeCompare(b.eventDate || '');
  });

  return events.slice(0, count);
}

export async function getArchivedEvents(count = 50): Promise<EventItem[]> {
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  const collectionsToTry = ['event_logs', 'events', 'events_archive', 'archived_events'];
  const eventMap = new Map<string, EventItem>();

  for (const colName of collectionsToTry) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const item = normalizeEvent(doc.id, doc.data());
          if (item.status !== 'draft') {
            // If date is before today, or marked as completed/archived
            if ((item.eventDate && item.eventDate < today) || item.status === 'archived' || item.status === 'past') {
              eventMap.set(doc.id, item);
            }
          }
        });
      }
    } catch (e) {
      console.warn(`Querying archived events from ${colName} failed:`, e);
    }
  }

  const events = Array.from(eventMap.values());
  // Sort descending by event date (most recent past event first)
  events.sort((a, b) => {
    return (b.eventDate || '').localeCompare(a.eventDate || '');
  });

  return events.slice(0, count);
}

export async function getAllLeadershipMembers(category?: string) {
  if (!db) return [];
  let q;
  if (category) {
    const snap = await getDocs(query(collection(db, "leadership_members"), orderBy("createdAt", "desc")));
    let docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    return docs.filter(d => d.type && d.type.toLowerCase() === category.toLowerCase());
  } else {
    q = query(collection(db, "leadership_members"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export async function getNotices() {
  if (!db) return [];
  const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getMagazines() {
  if (!db) return [];
  const q = query(collection(db, "magazines"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getResources() {
  if (!db) return [];
  const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getFaqs() {
  if (!db) return [];
  const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getGalleries() {
  if (!db) return [];
  const q = query(collection(db, "gallery_items"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export interface MembershipRecord {
  id: string;
  membershipId: string;
  fullName: string;
  name: string;
  batch: string | number;
  department: string;
  photoUrl: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  status?: string;
  role?: string;
  designation?: string;
  issueDate?: string;
  validUntil?: string;
  session?: string;
  studentId?: string;
  description?: string;
  [key: string]: any;
}

export async function getMembership(queryStr: string): Promise<MembershipRecord | null> {
  if (!db || !queryStr) return null;
  const cleanQuery = queryStr.trim();

  const collectionsToTry = ["memberships", "members", "leadership_members"];

  for (const colName of collectionsToTry) {
    try {
      // 1. By membershipId
      let q = query(collection(db, colName), where("membershipId", "==", cleanQuery));
      let snap = await getDocs(q);

      // 2. By studentId
      if (snap.empty) {
        q = query(collection(db, colName), where("studentId", "==", cleanQuery));
        snap = await getDocs(q);
      }

      // 3. By email / emailAddress
      if (snap.empty) {
        q = query(collection(db, colName), where("email", "==", cleanQuery));
        snap = await getDocs(q);
      }
      if (snap.empty) {
        q = query(collection(db, colName), where("emailAddress", "==", cleanQuery));
        snap = await getDocs(q);
      }

      // 4. By document ID
      if (snap.empty) {
        q = query(collection(db, colName), where("__name__", "==", cleanQuery));
        snap = await getDocs(q);
      }

      if (!snap.empty) {
        const raw = snap.docs[0].data() as any;
        const fullName = raw.fullName || raw.name || raw.memberName || 'Club Member';
        const photoUrl = raw.photoUrl || raw.photo || raw.imageUrl || raw.avatar || `https://picsum.photos/seed/${encodeURIComponent(cleanQuery)}/400/400`;
        const batch = raw.batch !== undefined && raw.batch !== null ? raw.batch : (raw.batchNo || '');
        const department = raw.department || raw.dept || 'Civil Engineering';
        const facebookUrl = raw.facebookUrl || raw.facebook || '';
        const linkedinUrl = raw.linkedinUrl || raw.linkedin || '';
        const email = raw.emailAddress || raw.email || '';
        const phone = raw.phone || raw.contact || raw.contactNo || '';
        const membershipId = raw.membershipId || raw.id || snap.docs[0].id;
        const status = raw.status || 'Active';
        const bloodGroup = raw.bloodGroup || raw.blood || '';
        const issueDate = raw.issueDate || raw.joinedDate || (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active Member');

        return {
          id: snap.docs[0].id,
          ...raw,
          membershipId,
          fullName,
          name: fullName,
          batch,
          department,
          photoUrl,
          facebookUrl,
          linkedinUrl,
          email,
          phone,
          status,
          bloodGroup,
          issueDate,
        };
      }
    } catch (err) {
      console.error(`Error querying ${colName} for membership:`, err);
    }
  }
  return null;
}

export async function getCertificate(certificateId: string) {
  if (!db) return null;
  const q = query(collection(db, "certificates"), where("certificateId", "==", certificateId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getConstitution() {
  if (!db) return null;
  try {
    const q = query(collection(db, "pages_static"), where("__name__", "==", "constitution"));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (e) {
    console.error("Failed to fetch constitution", e);
    return null;
  }
}

export async function getHistory() {
  if (!db) return null;
  try {
    const q = query(collection(db, "pages_static"), where("__name__", "==", "history"));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (e) {
    console.error("Failed to fetch history", e);
    return null;
  }
}

export async function getLocation() {
  if (!db) return null;
  try {
    const qLocation = query(collection(db, "site_settings"), where("__name__", "==", "location"));
    const snapLocation = await getDocs(qLocation);
    const locationData = snapLocation.empty ? null : snapLocation.docs[0].data();

    const qFooter = query(collection(db, "site_settings"), where("__name__", "==", "footer"));
    const snapFooter = await getDocs(qFooter);
    const footerData = snapFooter.empty ? null : snapFooter.docs[0].data();

    return { 
        id: "location", 
        mapIframe: locationData?.mapIframe,
        address: footerData?.address,
        ...locationData
    };
  } catch (e) {
    console.error("Failed to fetch location", e);
    return null;
  }
}
