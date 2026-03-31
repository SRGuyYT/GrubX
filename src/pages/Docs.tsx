import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Book, PlayCircle, ShieldAlert, MonitorPlay, Zap, HelpCircle } from "lucide-react";

export default function Docs() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 sticky top-24 bg-card/30 border border-border/30 rounded-xl p-4">
          <h3 className="font-semibold text-lg mb-4 px-2">Documentation</h3>
          <nav className="flex flex-col gap-1">
            <a href="#getting-started" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
              <Zap className="w-4 h-4" /> Getting Started
            </a>
            <a href="#player" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
              <PlayCircle className="w-4 h-4" /> Player System
            </a>
            <a href="#watch-options" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
              <MonitorPlay className="w-4 h-4" /> Watch Options
            </a>
            <a href="#error-codes" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
              <ShieldAlert className="w-4 h-4" /> Error Codes
            </a>
            <a href="#faq" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-4 h-4" /> FAQ
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-4xl prose prose-invert prose-red prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-a:text-primary hover:prose-a:text-primary/80">
          
          <div id="getting-started" className="scroll-mt-24 mb-16">
            <h1>Getting Started with Grubed X</h1>
            <p className="text-xl text-muted-foreground lead">Grubed X is a premium cinematic streaming platform designed for movie lovers. It provides a seamless, ad-free feeling interface for exploring and watching media.</p>
            <p>To get the most out of Grubed X, we recommend <Link href="/register">creating an account</Link>. While guest browsing is supported, an account unlocks powerful features like Continue Watching, Watchlists, and sync across devices.</p>
          </div>

          <hr className="border-border/30 my-12" />

          <div id="player" className="scroll-mt-24 mb-16">
            <h2>The Theater Mode Player</h2>
            <p>Our custom Theater Mode provides a distraction-free environment. It utilizes a secure iframe embed to deliver content.</p>
            <ul>
              <li><strong>Immersive:</strong> Fullscreen by default with dark overlays.</li>
              <li><strong>Smart:</strong> Saves your progress every 10 seconds automatically.</li>
              <li><strong>Binge-ready:</strong> Auto-plays the next episode for TV shows (configurable in Settings).</li>
            </ul>
            <div className="bg-muted/30 p-4 rounded-lg border border-border/20 font-mono text-sm">
              <span className="text-muted-foreground">// Player Event System</span><br/>
              {`{ type: "PLAYER_EVENT", data: { event: "timeupdate", progress: 45, ... } }`}
            </div>
          </div>

          <hr className="border-border/30 my-12" />

          <div id="watch-options" className="scroll-mt-24 mb-16">
            <h2>Watch Options</h2>
            <h3>Movies</h3>
            <p>Movies load directly into the player. If you've watched part of a movie previously, the "Play" button transforms into "Resume" and will pick up exactly where you left off.</p>
            <h3>TV Shows</h3>
            <p>TV shows offer a full episode browser. Select your season from the dropdown, then click any episode to launch Theater Mode. You can also change episodes directly within the player UI.</p>
          </div>

          <hr className="border-border/30 my-12" />

          <div id="error-codes" className="scroll-mt-24 mb-16">
            <h2>Error Codes Reference</h2>
            <p>If you encounter an issue, reference this table. Error codes appear in the bottom right of error screens.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 pr-4 text-primary">Code</th>
                    <th className="py-3 px-4">Meaning</th>
                    <th className="py-3 px-4">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-sm font-bold">GX-PLAYER-001</td>
                    <td className="py-3 px-4">Iframe failed to load</td>
                    <td className="py-3 px-4 text-muted-foreground">The streaming provider is unreachable. Wait a moment and retry.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-sm font-bold">GX-PLAYER-004</td>
                    <td className="py-3 px-4">No stream available</td>
                    <td className="py-3 px-4 text-muted-foreground">The specific movie or episode is missing from the database.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-sm font-bold">GX-NET-001</td>
                    <td className="py-3 px-4">API request failed</td>
                    <td className="py-3 px-4 text-muted-foreground">Our servers are down. Check your internet connection.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-sm font-bold">GX-AUTH-001</td>
                    <td className="py-3 px-4">Invalid credentials</td>
                    <td className="py-3 px-4 text-muted-foreground">Incorrect email or password during login.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-border/30 my-12" />

          <div id="faq" className="scroll-mt-24 mb-16">
            <h2>Frequently Asked Questions</h2>
            <h4>How do I turn off Auto-play?</h4>
            <p>Go to your Account Settings and toggle off "Auto-Play Next Episode".</p>
            <h4>Why are popups opening?</h4>
            <p>Some streaming sources trigger popups. Enable "Block Popups" in Settings to minimize this, though it may affect playback on certain aggressive hosters.</p>
            <h4>Is it free?</h4>
            <p>Yes, Grubed X is completely free to use.</p>
          </div>

        </div>
      </div>
    </Layout>
  );
}