/**
 * User-First SEO Validation
 * Ensures SEO doesn't compromise user experience
 */

export class UserFirstSEOValidator {
  constructor() {
    this.validationRules = {
      // User experience rules
      titleReadability: {
        test: (title) => title && title.length >= 10 && title.length <= 60,
        message: "Title should be readable and descriptive (10-60 chars)",
        impact: "Users need clear page titles to understand content",
      },

      descriptionValue: {
        test: (desc) => desc && desc.length >= 50 && desc.length <= 160,
        message: "Description should provide value to users (50-160 chars)",
        impact: "Users rely on descriptions to decide if content is relevant",
      },

      noJavaScriptFallback: {
        test: (element) => this.hasNoScriptFallback(element),
        message: "Critical content should work without JavaScript",
        impact: "Users with disabled JS or slow connections need access",
      },

      accessibilityCompliance: {
        test: (element) => this.checkAccessibility(element),
        message: "SEO elements should be accessible",
        impact: "Screen readers and assistive tech users need proper markup",
      },
    };
  }

  validateSEOForUsers(seoData, pageElement) {
    const results = {
      userExperience: "good",
      jsDisabledExperience: "unknown",
      searchBotExperience: "good",
      worstCaseScenario: [],
      recommendations: [],
    };

    // Test each validation rule
    Object.entries(this.validationRules).forEach(([ruleName, rule]) => {
      const testValue = ruleName.includes("title")
        ? seoData.title
        : ruleName.includes("description")
          ? seoData.description
          : pageElement;

      if (!rule.test(testValue)) {
        results.recommendations.push({
          rule: ruleName,
          message: rule.message,
          impact: rule.impact,
          severity: this.getSeverity(ruleName),
        });
      }
    });

    // Test JavaScript disabled scenario
    results.jsDisabledExperience = this.testNoJSExperience(pageElement);

    // Test search bot experience
    results.searchBotExperience = this.testBotExperience(seoData);

    // Identify worst-case scenarios
    results.worstCaseScenario = this.identifyWorstCases(seoData, pageElement);

    return results;
  }

  hasNoScriptFallback(element) {
    if (!element) return false;

    // Check for noscript tags
    const noscriptTags = element.querySelectorAll("noscript");

    // Check for server-side rendered content
    const hasSSRContent = element.querySelector('[data-ssr="true"]');

    // Check for critical content in HTML
    const hasCriticalContent = element.querySelector(
      "h1, .hero-content, .course-title",
    );

    return noscriptTags.length > 0 || hasSSRContent || hasCriticalContent;
  }

  checkAccessibility(element) {
    if (!element) return false;

    const issues = [];

    // Check for proper heading hierarchy
    const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) {
      issues.push("No heading structure found");
    }

    // Check for alt text on images
    const images = element.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute("aria-label")) {
        issues.push("Image missing alt text");
      }
    });

    // Check for ARIA labels on interactive elements
    const interactive = element.querySelectorAll("button, a, input");
    interactive.forEach((el) => {
      if (!el.textContent.trim() && !el.getAttribute("aria-label")) {
        issues.push("Interactive element missing accessible name");
      }
    });

    return issues.length === 0;
  }

  testNoJSExperience(element) {
    if (!element) return "poor";

    // Simulate JavaScript disabled
    const criticalContent = element.querySelector(
      "h1, .hero-content, .main-content",
    );
    const hasStaticContent =
      criticalContent && criticalContent.textContent.trim().length > 0;

    const hasNoscriptFallbacks =
      element.querySelectorAll("noscript").length > 0;
    const hasSSRContent = element.querySelector('[data-ssr="true"]');

    if (hasStaticContent && (hasNoscriptFallbacks || hasSSRContent)) {
      return "good";
    } else if (hasStaticContent) {
      return "acceptable";
    } else {
      return "poor";
    }
  }

  testBotExperience(seoData) {
    const score = {
      title: seoData.title ? 25 : 0,
      description: seoData.description ? 25 : 0,
      canonical: seoData.canonical ? 25 : 0,
      structuredData: seoData.structuredData ? 25 : 0,
    };

    const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

    if (totalScore >= 75) return "good";
    if (totalScore >= 50) return "acceptable";
    return "poor";
  }

  identifyWorstCases(seoData, pageElement) {
    const scenarios = [];

    // Scenario 1: JavaScript disabled + slow connection
    if (!this.hasNoScriptFallback(pageElement)) {
      scenarios.push({
        scenario: "JavaScript disabled + slow connection",
        impact: "Users see blank page or loading spinner indefinitely",
        solution: "Add server-side rendering or noscript fallbacks",
      });
    }

    // Scenario 2: Search bot crawling with missing metadata
    if (!seoData.title || !seoData.description) {
      scenarios.push({
        scenario: "Search bot crawling with missing metadata",
        impact: "Poor search result appearance, low click-through rates",
        solution: "Ensure all pages have complete meta tags",
      });
    }

    // Scenario 3: Screen reader user with poor structure
    if (!this.checkAccessibility(pageElement)) {
      scenarios.push({
        scenario: "Screen reader user navigating page",
        impact: "Difficult navigation, missing context, poor UX",
        solution: "Improve heading structure and ARIA labels",
      });
    }

    // Scenario 4: Mobile user on slow network
    const hasLargeImages =
      pageElement?.querySelectorAll('img:not([loading="lazy"])').length > 3;
    if (hasLargeImages) {
      scenarios.push({
        scenario: "Mobile user on slow network",
        impact: "Long loading times, high data usage, poor Core Web Vitals",
        solution: "Implement proper image optimization and lazy loading",
      });
    }

    return scenarios;
  }

  getSeverity(ruleName) {
    const severityMap = {
      titleReadability: "high",
      descriptionValue: "medium",
      noJavaScriptFallback: "high",
      accessibilityCompliance: "high",
    };

    return severityMap[ruleName] || "medium";
  }
}
