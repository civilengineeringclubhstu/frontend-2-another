import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

export async function getLatestBlogs(count = 3) {
  if (!db) return [];
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllBlogs() {
  if (!db) return [];
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getUpcomingEvents(count = 10) {
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, "event_logs"),
    where("eventDate", ">=", today),
    orderBy("eventDate", "asc"),
    limit(count)
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    const fallbackQ = query(collection(db, "event_logs"), orderBy("eventDate", "asc"));
    const snap = await getDocs(fallbackQ);
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter((d: any) => d.eventDate >= today)
      .slice(0, count);
  }
}

export async function getAllLeadershipMembers(category?: string) {
  if (!db) return [];
  let q;
  if (category) {
    // If we have a category, filter by it. We might need an index for this if we orderBy createdAt.
    // For simplicity without assuming index, we fetch all and filter in memory, or we just query by category without ordering.
    // Let's filter in memory for now to avoid requiring composite indexes on firestore.
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

export async function getArchivedEvents(count = 50) {
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  try {
    const q = query(
      collection(db, "event_logs"),
      where("eventDate", "<", today),
      orderBy("eventDate", "desc"),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch(e) {
    // Fallback if missing index
    const fallbackQ = query(collection(db, "event_logs"), orderBy("eventDate", "desc"));
    const snap = await getDocs(fallbackQ);
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter((d: any) => d.eventDate < today)
      .slice(0, count);
  }
}

export async function getMembership(membershipId: string) {
  if (!db) return null;
  const q = query(collection(db, "memberships"), where("membershipId", "==", membershipId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
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

export async function getBlogById(id: string) {
  if (!db) return null;
  const q = query(collection(db, "blogs"), where("__name__", "==", id));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}
