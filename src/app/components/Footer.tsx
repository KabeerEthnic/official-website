import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#2d1b20] to-[#1a1013] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl text-white mb-4">
              Kabeer <span className="text-[#E89B3C]">The Ethnic Store</span>
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Celebrating India's rich heritage through exquisite ethnic wear since 2011.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-[#6B2C3E] rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-[#6B2C3E] rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-[#6B2C3E] rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-[#6B2C3E] rounded-full flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Our Collections
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Care Instructions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white mb-4">Policies</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Returns & Exchange
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E89B3C] transition-colors">
                  Payment Options
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E89B3C] flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  123 Heritage Lane, Fashion District, Mumbai - 400001, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#E89B3C] flex-shrink-0" />
                <a href="tel:+911234567890" className="text-gray-400 hover:text-[#E89B3C] transition-colors">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#E89B3C] flex-shrink-0" />
                <a
                  href="mailto:hello@kabeerethnic.com"
                  className="text-gray-400 hover:text-[#E89B3C] transition-colors"
                >
                  hello@kabeerethnic.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2026 Kabeer The Ethnic Store. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#E89B3C] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-[#E89B3C] transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-[#E89B3C] transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}