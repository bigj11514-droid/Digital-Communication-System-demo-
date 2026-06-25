self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Notice', body: 'You have a new notice from [school name here].' };
  const options = {
    body: data.body,
    icon: 'icon-192.png',
    badge: 'icon-72.png',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});

// i want to make a live notice board for my school. I want the admin to be able to post notices and all the subscribers to receive them in real time. I also want to use Firebase for this. Can you help me with the code?
// Import Firebase (usually done via CDN or npm modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = { /* Your Firebase Config Snippet */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FOR THE ADMIN: SENDING ---
function adminPostNotice(title, details, type) {
  // Only execute if password/access code verified
  addDoc(collection(db, "notices"), {
    title: title,
    details: details,
    type: type,
    timestamp: new Date()
  });
}

// --- FOR THE SUBSCRIBERS: RECEIVING LIVE UPDATES ---
// This actively "listens" to the database. Whenever the admin adds something, this fires for EVERY user.
const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
  const noticesContainer = document.getElementById("notices-container");
  noticesContainer.innerHTML = ""; // Clear old UI list
  
  snapshot.forEach((doc) => {
    const notice = doc.data();
    // Use your existing UI code structure to append the new item
    noticesContainer.innerHTML += `
      <div class="notice-card ${notice.type}">
        <h3>${notice.title}</h3>
        <p>${notice.details}</p>
      </div>
    `;
    
    // Optional: trigger a browser alert/sound for a true "notification" feeling
    // alert(New School Notice: ${notice.title});
  });
});