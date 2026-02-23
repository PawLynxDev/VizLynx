import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/vizlynx-logo.png"
                alt="VizLynx Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-lg font-bold text-gray-900">VizLynx</span>
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              AI-powered marketing content studio for e-commerce.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Product
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/promote"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Promote
                </Link>
              </li>
              <li>
                <Link
                  href="/remove-bg"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Remove Background
                </Link>
              </li>
              <li>
                <Link
                  href="/brand-kits"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Brand Kits
                </Link>
              </li>
              <li>
                <Link
                  href="/assets"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} VizLynx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
