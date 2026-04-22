import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsApi, faqApi } from "../api";
import ThemeToggle from "../components/ThemeToggle";
import {
  ArrowLeft, Upload, Zap, AlertCircle, Loader, CheckCircle, X,
  Brain, TrendingUp, TrendingDown, Minus, BookOpen, ChevronDown, ChevronUp, Lightbulb, Clock,
} from "lucide-react";

const COURSES = [
  "CS101 - Introduction to Programming",
  "CS202 - Data Structures",
  "CS301 - Algorithms",
  "MAT201 - Calculus II",
  "MAT301 - Linear Algebra",
  "ENG102 - English Composition",
  "PHY201 - Physics I",
  "CHEM401 - Organic Chemistry",
];

const CATEGORIES = [
  "Technical Support",
  "Academic",
  "Financial",
  "Administrative",
  "Other",
];

const CATEGORY_PRIORITY = {
  "Technical Support": "medium",
  "Academic": "medium",
  "Financial": "high",
  "Administrative": "low",
  "Other": "low",
};

function analyzeLocally(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const urgentWords = ["asap", "urgent", "emergency", "critical", "immediately", "deadline", "exam", "locked out", "payment failed"];
  const negativeWords = ["broken", "error", "fail", "crash", "bug", "problem", "wrong", "bad", "cannot", "unable", "stuck", "not working"];
  const positiveWords = ["thank", "great", "good", "resolved", "working", "appreciate"];
  const urgentHits = urgentWords.filter(w => text.includes(w)).length;
  const negHits = negativeWords.filter(w => text.includes(w)).length;
  const posHits = positiveWords.filter(w => text.includes(w)).length;
  let sentiment = "neutral";
  if (urgentHits > 0 || negHits > posHits + 1) sentiment = "negative";
  else if (posHits > negHits) sentiment = "positive";
  let priority = "medium";
  if (urgentHits > 0) priority = "urgent";
  else if (negHits >= 2) priority = "high";
  return { sentiment, priority, urgent: urgentHits > 0 };
}

function FaqCard({ faq, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-teal-200 bg-teal-50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-teal-100 transition"
      >
        <BookOpen size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-900 leading-snug">{faq.question}</p>
          <p className="text-xs text-teal-600 mt-0.5">{faq.category}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {expanded ? <ChevronUp size={15} className="text-teal-500" /> : <ChevronDown size={15} className="text-teal-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-teal-200 bg-white">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{faq.answer}</pre>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">Did this answer your question?</span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <CheckCircle size={13} />
              Yes, resolved — dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", course: "", category: "", priority: "medium" });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [dismissedFaqs, setDismissedFaqs] = useState(new Set());
  const [faqsVisible, setFaqsVisible] = useState(true);
  const debounceRef = useRef(null);
  const faqDebounceRef = useRef(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [similarTickets, setSimilarTickets] = useState([]);

  // Fetch estimated response time on mount
  useEffect(() => {
    ticketsApi.getEstimatedResponseTime()
      .then(data => setEstimatedTime(data.avg_response_hours))
      .catch(() => setEstimatedTime(null));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (formData.title.length > 5 || formData.description.length > 10) {
      debounceRef.current = setTimeout(() => setAiInsight(analyzeLocally(formData.title, formData.description)), 500);
    } else {
      setAiInsight(null);
    }
    return () => clearTimeout(debounceRef.current);
  }, [formData.title, formData.description]);

  useEffect(() => {
    clearTimeout(faqDebounceRef.current);
    const query = `${formData.title} ${formData.description}`.trim();
    if (query.length < 8) { setFaqs([]); return; }
    faqDebounceRef.current = setTimeout(async () => {
      setFaqLoading(true);
      try {
        const data = await faqApi.search(query, formData.category || null);
        setFaqs(data.faqs || []);
        setFaqsVisible(true);
      } catch { setFaqs([]); }
      finally { setFaqLoading(false); }
    }, 800);
    return () => clearTimeout(faqDebounceRef.current);
  }, [formData.title, formData.description, formData.category]);

  const visibleFaqs = faqs.filter(f => !dismissedFaqs.has(f.id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "category" && value) updated.priority = CATEGORY_PRIORITY[value] || "medium";
      return updated;
    });
  };

  const handleFileUpload = (e) => setAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
  const removeAttachment = (idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      const result = await ticketsApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        course: formData.course || null,
      });
      // Check for similar tickets from AI analysis
      if (result.ai_analysis?.similar_tickets && result.ai_analysis.similar_tickets.length > 0) {
        setSimilarTickets(result.ai_analysis.similar_tickets);
      }
      if (attachments.length > 0) await ticketsApi.uploadAttachments(result.id, attachments);
      setSuccess(true);
      setTimeout(() => navigate("/my-tickets"), 1800);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ticket Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <p className="text-sm text-teal-600 font-medium">Dashboard</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Ticket</h1>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">Describe your issue and we'll get back to you as soon as possible.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Estimated Response Time Banner */}
              {estimatedTime !== null && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex gap-3">
                  <Clock className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-teal-900">Average Response Time</h3>
                    <p className="text-sm text-teal-800 mt-1">
                      Our team typically responds within <strong>{estimatedTime < 1 ? `${Math.round(estimatedTime * 60)} minutes` : estimatedTime < 24 ? `${estimatedTime.toFixed(1)} hours` : `${(estimatedTime / 24).toFixed(1)} days`}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Similar Tickets Warning */}
              {similarTickets.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900 mb-2">Similar Tickets Found</h3>
                      <p className="text-sm text-orange-800 mb-3">We found {similarTickets.length} similar ticket{similarTickets.length !== 1 ? 's' : ''} that might help:</p>
                      <div className="space-y-2">
                        {similarTickets.map((sim, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{sim.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Ticket #{sim.id.slice(-6).toUpperCase()} · {sim.status}</p>
                              </div>
                              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full flex-shrink-0">
                                {Math.round(sim.similarity * 100)}% match
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-orange-700 mt-3">Consider checking these tickets before submitting a new one.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Zap className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900">Smart Prioritization</h3>
                  <p className="text-sm text-blue-800 mt-1">Priority is auto-suggested based on your category. You can adjust it manually below.</p>
                </div>
              </div>

              {/* AI sentiment insight */}
              {aiInsight && (
                <div className={`rounded-lg p-4 flex gap-3 border ${
                  aiInsight.urgent ? "bg-red-50 border-red-200" :
                  aiInsight.sentiment === "negative" ? "bg-orange-50 border-orange-200" :
                  aiInsight.sentiment === "positive" ? "bg-green-50 border-green-200" :
                  "bg-gray-50 border-gray-200"
                }`}>
                  <Brain size={20} className={`flex-shrink-0 mt-0.5 ${
                    aiInsight.urgent ? "text-red-600" :
                    aiInsight.sentiment === "negative" ? "text-orange-600" :
                    aiInsight.sentiment === "positive" ? "text-green-600" : "text-gray-500"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">AI Analysis</span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        aiInsight.sentiment === "negative" ? "bg-orange-100 text-orange-700" :
                        aiInsight.sentiment === "positive" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {aiInsight.sentiment === "negative" ? <TrendingDown size={11} /> :
                         aiInsight.sentiment === "positive" ? <TrendingUp size={11} /> : <Minus size={11} />}
                        {aiInsight.sentiment} tone
                      </span>
                      {aiInsight.urgent && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">⚡ Urgent signals detected</span>}
                      {aiInsight.priority !== "medium" && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Suggested priority: {aiInsight.priority}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Ticket Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="Brief description of your issue" maxLength={200} required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Be specific (e.g., "Cannot access lecture videos for CS101")</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Describe your issue in detail — include any error messages, steps you've tried, etc."
                  rows="6" maxLength={5000} required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formData.description.length} / 5000</span>
                </div>
              </div>

              {/* FAQ Suggestions */}
              {(faqLoading || (visibleFaqs.length > 0 && faqsVisible)) && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/60 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-teal-200 bg-teal-50">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={16} className="text-teal-600" />
                      <span className="text-sm font-semibold text-teal-900">
                        {faqLoading ? "Searching for answers…" : `${visibleFaqs.length} possible answer${visibleFaqs.length !== 1 ? "s" : ""} found`}
                      </span>
                      {!faqLoading && <span className="text-xs text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Check before submitting</span>}
                    </div>
                    {!faqLoading && (
                      <button type="button" onClick={() => setFaqsVisible(false)} className="text-teal-400 hover:text-teal-600 transition">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  {faqLoading ? (
                    <div className="px-4 py-4 space-y-2">
                      {[1, 2].map(i => <div key={i} className="h-10 bg-teal-100 rounded-lg animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {visibleFaqs.map(faq => (
                        <FaqCard key={faq.id} faq={faq}
                          onDismiss={() => setDismissedFaqs(prev => new Set([...prev, faq.id]))} />
                      ))}
                      <p className="text-xs text-teal-600 text-center pt-1">If none of these help, continue filling out the form below.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Category <span className="text-red-500">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Related Course <span className="text-gray-400 text-xs font-normal ml-1">Optional</span>
                </label>
                <select name="course" value={formData.course} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select a course (if applicable)</option>
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Attachments</label>
                <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center hover:bg-teal-50 transition cursor-pointer">
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-teal-500 mb-2" size={28} />
                    <p className="text-teal-600 font-medium text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-600 ml-2 flex-shrink-0">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />{submitError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <><Loader size={18} className="animate-spin" /> Submitting...</> : "Submit Ticket"}
                </button>
                <button type="button" onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2 mb-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={18} />
                <h3 className="font-semibold text-yellow-900 text-sm">Tips for Better Support</h3>
              </div>
              <ul className="space-y-2 text-sm text-yellow-900">
                <li><strong>Be specific:</strong> Include course codes, error messages, or assignment names.</li>
                <li><strong>Add screenshots:</strong> Visual evidence speeds up resolution.</li>
                <li><strong>Try first:</strong> Clear cache or try a different browser before submitting.</li>
                <li><strong>Response time:</strong> Average 2–4 hours during business hours.</li>
              </ul>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <Lightbulb className="text-teal-600 flex-shrink-0" size={16} />
                <h3 className="font-semibold text-teal-900 text-sm">Smart FAQ Suggestions</h3>
              </div>
              <p className="text-xs text-teal-800">
                As you type your issue, we'll automatically search our knowledge base and show relevant answers — you may not even need to submit a ticket!
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 text-sm mb-2">Need Urgent Help?</h3>
              <p className="text-sm text-orange-800">Call Student Support at <strong>(555) 123-4567</strong></p>
              <p className="text-xs text-orange-700 mt-1">Mon–Fri, 9 AM – 5 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

