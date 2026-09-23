import { Briefcase, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareerPage() {
  const jobs = [
    { title: "Gym Equipment Product Specialist", location: "Global / Remote", type: "Full-Time", desc: "Assist commercial clients and athletes with fitness system consultations and custom layouts." },
    { title: "Global Logistics & Freight Manager", location: "Amsterdam Hub", type: "Full-Time", desc: "Coordinate worldwide courier and freight shipments of heavy gym gear." },
    { title: "Performance Sportswear Designer", location: "Remote", type: "Full-Time", desc: "Lead innovation across activewear fabrics, apparel fit, and technical training gear." },
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a3ff]">
            Join The Movement
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Careers At PG<span className="text-[#00a3ff]">X</span>
          </h1>
          <p className="text-slate-500 text-base mt-4">
            We are always seeking high-drive individuals passionate about fitness innovation, human performance, and global athletic lifestyle.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {jobs.map((job, idx) => (
            <div key={idx} className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 hover:shadow-lg transition-all">
              <div>
                <h3 className="text-lg font-black uppercase font-mono text-slate-900 mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#00a3ff]"/> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-[#00a3ff]"/> {job.type}</span>
                </div>
                <p className="text-slate-600 text-sm max-w-xl leading-relaxed">{job.desc}</p>
              </div>
              <div className="shrink-0">
                <Button className="w-full md:w-auto h-11 bg-[#060b13] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors px-6">
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-[#060b13] text-white rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto border border-slate-800 shadow-xl">
           <h3 className="text-2xl font-black uppercase font-mono tracking-tight mb-2">Don't See The Right Role?</h3>
           <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">Send us your credentials and background. We are constantly expanding our engineering, logistics, and design teams.</p>
           <a href="mailto:careers@playgroundfitnex.com" className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-black text-xs uppercase tracking-wider transition-all">
             Email Your Resume
           </a>
        </div>
      </div>
    </div>
  );
}
