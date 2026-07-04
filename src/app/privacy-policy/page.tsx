import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the CookWithPrem privacy policy to understand how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-8">
            Privacy Policy
          </h1>

          <p className="text-text-secondary text-sm mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-text-secondary leading-relaxed">
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                1. Information We Collect
              </h2>
              <p>
                When you use CookWithPrem, we may collect the following information:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Name and email address when you create an account</li>
                <li>Profile information from Google if you use Google Sign-In</li>
                <li>Comments and ratings you leave on recipes</li>
                <li>Contact form submissions</li>
                <li>Newsletter subscription information</li>
                <li>Usage data such as pages visited and interactions</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                2. How We Use Your Information
              </h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Provide and improve our services</li>
                <li>Personalize your experience</li>
                <li>Send newsletters (only if subscribed)</li>
                <li>Respond to your messages and inquiries</li>
                <li>Maintain the security of our platform</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                3. Data Storage
              </h2>
              <p>
                Your data is stored securely using Firebase (Google Cloud) services.
                We implement appropriate security measures to protect your personal
                information against unauthorized access, alteration, or destruction.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                4. Third-Party Services
              </h2>
              <p>
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Firebase Authentication for user login</li>
                <li>Firebase Firestore for data storage</li>
                <li>Firebase Storage for image storage</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                5. Cookies
              </h2>
              <p>
                CookWithPrem uses essential cookies for authentication and session
                management. We do not use tracking or advertising cookies.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your account</li>
                <li>Unsubscribe from newsletters</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                7. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact
                us at{" "}
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
