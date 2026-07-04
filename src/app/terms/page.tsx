import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the CookWithPrem terms and conditions for using our platform and services.",
};

export default function TermsPage() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-8">
            Terms &amp; Conditions
          </h1>

          <p className="text-text-secondary text-sm mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-text-secondary leading-relaxed">
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using CookWithPrem, you agree to be bound by these
                Terms &amp; Conditions. If you do not agree with any part of these terms,
                please do not use our website.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                2. User Accounts
              </h2>
              <p>
                To access all features, you must create an account using Google Sign-In
                or email/password. You are responsible for maintaining the confidentiality
                of your account and password. You agree to accept responsibility for all
                activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                3. Content Usage
              </h2>
              <p>
                All recipes, images, text, and other content on CookWithPrem are the
                property of Prem Sagar Pandey. You may use recipes for personal,
                non-commercial purposes. You may not reproduce, distribute, or sell our
                content without prior written permission.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                4. User-Generated Content
              </h2>
              <p>
                By posting comments, ratings, or other content, you grant CookWithPrem
                a non-exclusive, royalty-free license to use, display, and distribute
                that content on our platform. You must not post content that is offensive,
                harmful, or violates any laws.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                5. Disclaimer
              </h2>
              <p>
                CookWithPrem provides recipes and cooking tutorials for educational purposes.
                We are not responsible for any health issues, allergies, or injuries that may
                result from following our recipes. Always use caution when cooking and be
                aware of food allergies.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                6. Modifications
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be
                posted on this page with an updated date. Your continued use of the website
                after changes constitutes acceptance of the modified terms.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                7. Contact
              </h2>
              <p>
                For questions about these Terms &amp; Conditions, contact us at{" "}
                <a
                  href="mailto:hello@cookwithprem.com"
                  className="text-warm-brown hover:underline"
                >
                  hello@cookwithprem.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
