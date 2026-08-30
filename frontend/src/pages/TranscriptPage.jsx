import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Copy, 
  Download, 
  Search, 
  Hand, 
  Mic, 
  MessageSquare, 
  CheckCircle2, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';

const TranscriptPage = () => {
  const { meetingId } = useParams();
  const [transcript, setTranscript] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await apiService.getTranscript(meetingId);
        if (tRes?.transcript) setTranscript(tRes.transcript);

        const mRes = await apiService.getMeeting(meetingId);
        if (mRes?.meeting) setMeeting(mRes.meeting);
      } catch (err) {
        console.error('Error fetching transcript', err);
      }
    };
    load();
  }, [meetingId]);

  const entries = transcript?.entries || [];

  const filteredEntries = entries.filter((e) => {
    const matchesSearch = e.text.toLowerCase().includes(search.toLowerCase()) || e.speaker.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'speech') return matchesSearch && e.type === 'speech';
    if (filterType === 'sign') return matchesSearch && e.type === 'sign';
    if (filterType === 'chat') return matchesSearch && e.type === 'chat';
    return matchesSearch;
  });

  const getFilteredText = () => {
    return filteredEntries.map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const prefix = e.type === 'sign' ? '[SIGN]' : e.type === 'chat' ? '[CHAT]' : '[SPEECH]';
      const conf = e.type === 'sign' && e.confidence != null ? ` (${Math.round(e.confidence * 100)}% confidence)` : '';
      return `[${time}] ${prefix} ${e.speaker}: "${e.text}"${conf}`;
    }).join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFilteredText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = [
      `BridgeAble Multi-Modal Meeting Transcript`,
      `Session: ${meeting?.title || meetingId}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Total entries: ${filteredEntries.length}`,
      `Filter: ${filterType}`,
      '',
      '─'.repeat(60),
      '',
      getFilteredText() || 'No transcript entries available.'
    ].join('\n');

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `BridgeAble_Transcript_${meetingId}_${filterType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/history"
          className="p-2 rounded-xl bg-[#FBF8F3] border border-[#EADCC8] text-[#5A3E2B] hover:bg-[#EADCC8] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">
            Multi-Modal Meeting Transcript
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7167]">
            Session: <span className="font-bold text-[#5A3E2B]">{meeting?.title || meetingId}</span>
          </p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="card-warm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#7D7167] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words or speakers..."
            className="w-full bg-white border border-[#DCC8AE] rounded-xl py-2 pl-9 pr-3 text-xs text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'speech', 'sign', 'chat'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
                filterType === type
                  ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                  : 'bg-[#F7F1E8] text-[#7D7167] hover:bg-[#EADCC8]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Copy & Download */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-warm-sm"
            title="Download text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Transcript Log Container */}
      <div className="card-warm p-6 sm:p-8 space-y-4 shadow-warm-lg">
        <div className="border-b border-[#EADCC8] pb-3 flex items-center justify-between text-xs text-[#7D7167]">
          <span>Combined logs ({filteredEntries.length} items)</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Mic className="w-3 h-3 text-[#5A3E2B]" /> Speech</span>
            <span className="flex items-center gap-1"><Hand className="w-3 h-3 text-amber-700" /> Sign</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-[#7A5A42]" /> Chat</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, index) => {
              const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isSign = entry.type === 'sign';
              const isSpeech = entry.type === 'speech';

              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border transition ${
                    isSign
                      ? 'bg-[#EADCC8]/50 border-[#DCC8AE]'
                      : isSpeech
                      ? 'bg-white border-[#EADCC8]'
                      : 'bg-[#F7F1E8] border-[#EADCC8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#5A3E2B]">{entry.speaker}</span>
                      {isSign && (
                        <span className="badge-beige bg-amber-200 text-amber-900 font-bold flex items-center gap-1">
                          <Hand className="w-3 h-3" /> Sign Language
                        </span>
                      )}
                      {isSpeech && (
                        <span className="badge-beige font-semibold flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Speech
                        </span>
                      )}
                  {isSign && e.confidence != null && (
                        <span className="text-[10px] text-amber-700 font-semibold">
                          {Math.round(e.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#7D7167]">{time}</span>
                  </div>

                  <p className="text-sm text-[#2F261F] leading-relaxed pl-1">
                    "{entry.text}"
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-[#7D7167] text-sm">
              {entries.length === 0
                ? 'No transcript entries yet. Chat, speak, or use Sign AI during a meeting to generate transcript records.'
                : 'No entries match the current filter or search.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptPage;
