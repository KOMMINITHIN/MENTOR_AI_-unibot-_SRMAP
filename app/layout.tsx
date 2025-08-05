import "./globals.css";

export const metadata = {
  title: "Mentor - University Chatbot",
  description: "A ChatGPT-style chatbot for university students, powered by Groq Llama-4.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 