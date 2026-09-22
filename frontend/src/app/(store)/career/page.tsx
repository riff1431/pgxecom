import { Briefcase, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareerPage() {
  const jobs = [
    { title: "Digital Marketing Executive", location: "Dhaka (On-site)", type: "Full-Time", desc: "Manage our social media presence and run paid campaigns." },
    { title: "Delivery Management Officer", location: "Dhaka", type: "Full-Time", desc: "Coordinate daily dispatches and ensure smooth last-mile delivery." },
    { title: "Customer Support Rep", location: "Remote / Dhaka", type: "Part-Time", desc: "Handle user inquiries via phone and chat." },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
        <p className="text-gray-600">
          We are always looking for passionate people to help us build the best pure food delivery platform in Bangladesh.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {jobs.map((job, idx) => (
          <div key={idx} className="bg-white border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.type}</span>
              </div>
              <p className="text-gray-600 text-sm max-w-xl">{job.desc}</p>
            </div>
            <div className="shrink-0">
              <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700">Apply Now</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto border border-gray-100">
         <h3 className="text-xl font-bold text-gray-900 mb-2">Don't see a perfect fit?</h3>
         <p className="text-gray-600 mb-6">Send us your resume anyway! We might open a position for your talents soon.</p>
         <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">Email Your CV</Button>
      </div>
    </div>
  );
}
