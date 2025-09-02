# AI-Study-Buddy
Hackathon 2
---

## 🧠 AI Study Buddy — Flashcard Generator

An AI-powered educational tool that transforms study notes into interactive flashcards using Hugging Face NLP and Supabase for real-time storage and retrieval. Built for learners, educators, and hackathon heroes.

---

### 🚀 Features
- Generate flashcards from raw notes using Hugging Face QA models  
- Store and retrieve flashcards via Supabase  
- Interactive frontend with theme toggling and dropdown filters  
- Modular backend logic for scalability and multi-user support

---

### 🛠️ Tech Stack
| Layer        | Tools Used                          |
|-------------|--------------------------------------|
| Frontend     | HTML, CSS, JavaScript, Lovable.dev  |
| Backend      | Hugging Face API, Supabase REST     |
| Database     | Supabase (PostgreSQL)               |
| Deployment   | Bolt.new / GitHub Pages / Netlify   |

---

### 📦 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/ai-study-buddy.git
cd ai-study-buddy

# Install dependencies (if using Flask backend)
pip install flask requests

# Run locally
python app.py
```

---

### 🔐 Environment Variables

Create a `.env` file or config block with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
HF_API_TOKEN=your-huggingface-token
```

---

### 📄 Supabase Flashcards Schema

```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language_code VARCHAR(10) DEFAULT 'en',
  difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 🤖 Hugging Face Integration (JavaScript)

```javascript
async function generateFlashcard(context, question) {
  const response = await fetch("https://api-inference.huggingface.co/models/deepset/roberta-base-squad2", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_HF_API_TOKEN",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: { question, context } })
  });

  const result = await response.json();
  return {
    question,
    answer: result.answer || "No answer found"
  };
}
```

---

### 🧪 Supabase Fetch (JavaScript)

```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchFlashcards() {
  const { data, error } = await supabase.from("flashcards").select("*");
  if (error) console.error(error);
  return data;
}
```

---

### 🎨 Frontend Preview

```html
<textarea id="context" placeholder="Paste your notes..."></textarea>
<input id="question" placeholder="Enter a question..." />
<button onclick="generateFlashcard()">Generate</button>
<div id="output"></div>
```

---

### 📚 Future Enhancements
- User authentication with Supabase Auth  
- Study streak tracking and spaced repetition  
- Multilingual flashcard support  
- Collaborative decks and educator dashboards

---

### 🤝 Contributing
Pull requests welcome! For major changes, open an issue first to discuss what you’d like to change.

---

Want help customizing this for your GitHub repo or adding badges, screenshots, or deployment links? I can polish it further.
