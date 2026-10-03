import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been received! Our Chennai support team will contact you shortly.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEOHead
        title="Contact Us | Veedu Vadagaiku"
        description="Get in touch with Veedu Vadagaiku support in Chennai. We're here to help landlords and tenants."
      />

      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="text-xs font-black tracking-widest text-orange-600 uppercase">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          We're Here to Help
        </h1>
        <p className="text-sm text-gray-500">
          Have questions about listing your property, verifying listings, or need assistance with your search?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Office Location</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Phone & WhatsApp Support</h4>
              <p className="text-xs text-gray-500">+91 98400 12345</p>
              <p className="text-[11px] text-gray-400 mt-1">Mon - Sat: 9:00 AM - 7:00 PM</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Email Inquiries</h4>
              <p className="text-xs text-gray-500">support@veeduvadagaiku.com</p>
              <p className="text-[11px] text-gray-400 mt-1">Typical response within 2 hours</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Thank you for contacting Veedu Vadagaiku. Our team will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Send us a direct message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sundar Raman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sundar@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Message / Support Query
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can we assist you with rental listings in Chennai?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
