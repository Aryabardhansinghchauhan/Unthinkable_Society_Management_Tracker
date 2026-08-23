import React, { useState } from 'react';
import { ComplaintAttachment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Eye, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';

interface EvidenceViewerProps {
  attachments: ComplaintAttachment[];
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ attachments }) => {
  const beforePhotos = attachments.filter((a) => a.type === 'BEFORE');
  const resolutionPhotos = attachments.filter((a) => a.type === 'RESOLUTION');
  const otherPhotos = attachments.filter((a) => a.type === 'OTHER');

  const [activeModalImg, setActiveModalImg] = useState<string | null>(null);

  if (attachments.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-400 text-xs border-dashed">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        No photos or documents attached yet.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>Resolution Evidence & Attachments</span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {attachments.length}
        </span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Photos */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Before / Problem Photo</span>
          </div>

          {beforePhotos.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No initial problem photo attached.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {beforePhotos.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setActiveModalImg(item.url)}
                  className="group relative rounded-xl overflow-hidden aspect-video bg-slate-200 cursor-pointer border border-slate-200"
                >
                  <img
                    src={item.url}
                    alt="Before evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution Photos */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolution / Fixed Evidence</span>
          </div>

          {resolutionPhotos.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Resolution evidence photo will appear once work is marked resolved.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {resolutionPhotos.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setActiveModalImg(item.url)}
                  className="group relative rounded-xl overflow-hidden aspect-video bg-emerald-100 cursor-pointer border border-emerald-200"
                >
                  <img
                    src={item.url}
                    alt="Resolution evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeModalImg && (
        <div
          onClick={() => setActiveModalImg(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={activeModalImg}
            alt="Expanded view"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
