"use client";

import { useTheme } from "../providers";
import { FiShield, FiLock, FiKey, FiBell, FiCheckCircle, FiAlertCircle, FiSun, FiMoon } from "react-icons/fi";
import Link from "next/link";

export default function HowItsSafe() {
  const { theme, toggleTheme } = useTheme();

  const securityFeatures = [
    {
      icon: <FiShield className="h-6 w-6 text-primary" />,
      title: "End-to-End Encryption",
      description: "Your passwords are encrypted on your device before being stored, ensuring only you can access them."
    },
    {
      icon: <FiLock className="h-6 w-6 text-primary" />,
      title: "Master Password Protection",
      description: "A single master password protects all your stored passwords, adding an extra layer of security."
    },
    {
      icon: <FiKey className="h-6 w-6 text-primary" />,
      title: "Zero-Knowledge Architecture",
      description: "We never store your master password or encryption keys on our servers."
    },
    {
      icon: <FiBell className="h-6 w-6 text-primary" />,
      title: "Security Alerts",
      description: "Get notified immediately if we detect any suspicious activity or potential security breaches."
    },
    {
      icon: <FiCheckCircle className="h-6 w-6 text-primary" />,
      title: "Regular Security Audits",
      description: "Our security measures are regularly tested and audited by independent security experts."
    },
    {
      icon: <FiAlertCircle className="h-6 w-6 text-primary" />,
      title: "Breach Monitoring",
      description: "We continuously monitor for data breaches and will alert you if any of your accounts are compromised."
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation Bar */}
      <nav className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FiShield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">SecurePass</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How We Keep Your Data Safe</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your security is our top priority. We use industry-leading encryption and security practices
            to ensure your passwords remain protected at all times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="glass-effect rounded-xl p-6 card-hover">
              <div className="flex items-center space-x-4 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground button-hover"
          >
            <FiShield className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
} 