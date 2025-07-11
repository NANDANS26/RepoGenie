import type {
  Repository,
  AIContent,
  AITone,
  CustomSection,
} from '../store/useAppStore';
import type { EnhancedRepository } from './githubApi';

interface GeminiConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
  };
}

// Configuration with fallbacks
const config: GeminiConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  model: 'gemini-2.0-flash',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 45000, // Increased timeout for complex analysis
};

// Cache for storing API responses
const responseCache = new Map<string, AIContent>();

/**
 * Generate comprehensive AI content for a repository with deep analysis
 */
export const generateAIContent = async (
  repository: Repository | EnhancedRepository,
  aiTone: AITone,
  customSections: CustomSection[] = [],
  attempt = 0
): Promise<AIContent> => {
  // Check cache first
  const cacheKey = `${repository.id}-${aiTone.style}-${
    aiTone.template
  }-${JSON.stringify(customSections)}-enhanced`;
  
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!;
  }

  // Fallback to mock data if no API key
  if (!config.apiKey) {
    const mockData = generateAdvancedMockAIContent(repository, aiTone, customSections);
    responseCache.set(cacheKey, mockData);
    return mockData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(
      `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: createComprehensivePrompt(
                    repository,
                    aiTone,
                    customSections
                  ),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: getTemperatureForTone(aiTone.style),
            topK: 50,
            topP: 0.9,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_ONLY_HIGH',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_ONLY_HIGH',
            },
          ],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    const parsedContent = parseAdvancedAIResponse(
      generatedText,
      repository,
      aiTone,
      customSections
    );
    responseCache.set(cacheKey, parsedContent);
    return parsedContent;
  } catch (error) {
    console.error(`Attempt ${attempt + 1} failed:`, error);

    // Retry logic
    if (attempt < config.maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
      return generateAIContent(repository, aiTone, customSections, attempt + 1);
    }

    // Fallback to mock data after retries
    const mockData = generateAdvancedMockAIContent(repository, aiTone, customSections);
    responseCache.set(cacheKey, mockData);
    return mockData;
  }
};

/**
 * Create a comprehensive prompt that analyzes all aspects of the repository
 */
const createComprehensivePrompt = (
  repository: Repository | EnhancedRepository,
  aiTone: AITone,
  customSections: CustomSection[]
): string => {
  const enhancedRepo = repository as EnhancedRepository;
  
  const toneInstructions = {
    professional: `Use formal business language suitable for corporate presentations. 
    Focus on measurable outcomes, ROI, and strategic value. Maintain a neutral, 
    authoritative tone with precise terminology. Include business impact assessments.`,

    casual: `Use friendly, conversational language appropriate for team discussions. 
    Keep it approachable with occasional colloquialisms. Focus on practical benefits 
    and ease of use. Make it engaging and relatable.`,

    technical: `Use precise technical language with appropriate jargon. Include 
    implementation details, architecture patterns, and code quality assessment. 
    Reference specific technologies and methodologies where applicable. Provide deep technical insights.`,

    executive: `Use high-level, results-focused language. Emphasize business impact, 
    competitive advantage, and strategic positioning. Avoid technical details in 
    favor of outcomes and metrics. Focus on ROI and market positioning.`,

    academic: `Use scholarly language referencing established theories and sources. 
    Maintain a formal, peer-reviewed tone suitable for research or whitepapers.
    Include citations to best practices and industry standards.`,
  };

  const audienceInstructions = {
    developers:
      'Focus on technical implementation, code quality, architecture patterns, and development best practices.',
    managers:
      'Emphasize project management aspects, team productivity, resource allocation, and delivery timelines.',
    executives:
      'Highlight business value, strategic alignment, competitive advantages, and financial impact.',
    investors:
      'Focus on market opportunity, scalability potential, competitive positioning, and return on investment.',
    general:
      'Provide balanced coverage suitable for diverse stakeholders with varying technical backgrounds.',
  };

  const customSectionPrompts = customSections
    .filter((section) => section.enabled)
    .map(
      (section) => `
**${section.name}** (${section.type}):
${section.aiPrompt}
Expected format: ${
        section.type === 'list'
          ? 'Array of items'
          : section.type === 'table'
          ? 'Structured data'
          : 'Detailed text'
      }
`
    )
    .join('\n');

  // Build comprehensive repository context
  const repoContext = buildRepositoryContext(enhancedRepo);

  return `
You are an expert software analyst, technical writer, and business strategist with deep expertise in software architecture, market analysis, and technology assessment. You are preparing a comprehensive, professional analysis of a GitHub repository that will be used by ${aiTone.audience} to understand the project's technical merit, business value, social impact, and strategic importance.

**Analysis Configuration:**
- Writing Style: ${aiTone.style} - ${toneInstructions[aiTone.style]}
- Target Audience: ${aiTone.audience} - ${audienceInstructions[aiTone.audience]}
- Detail Level: ${aiTone.detailLevel}/5 (1=Brief, 5=Exhaustive)
- Technical Depth: ${aiTone.technicalDepth}/5 (1=High-level, 5=Deep technical)
- Focus Areas: ${
    aiTone.focusAreas.length > 0
      ? aiTone.focusAreas.join(', ')
      : 'Comprehensive analysis'
  }
- Custom Instructions: ${
    aiTone.customInstructions || 'Standard comprehensive analysis approach'
  }

${repoContext}

**CRITICAL ANALYSIS REQUIREMENTS:**

You must provide a deep, insightful analysis that goes far beyond basic metrics. Focus on:

1. **Technical Excellence & Innovation**: Analyze the actual code quality, architecture patterns, and innovative approaches
2. **Real-World Impact**: How does this project solve actual problems and create value?
3. **Social & Business Value**: What is the broader impact on society, industry, or specific communities?
4. **Future Potential**: Growth opportunities, scalability, and long-term viability
5. **Competitive Positioning**: How does this compare to alternatives and what makes it unique?

**Required Analysis Sections:**

1. **Executive Summary** (3-5 paragraphs):
   - Project's core purpose and value proposition
   - Key technical innovations and approaches
   - Real-world applications and impact
   - Strategic importance and market positioning
   - Community engagement and adoption metrics

2. **Key Features & Capabilities** (8-12 items):
   - Core functionality and technical capabilities
   - Unique innovations and differentiators
   - User experience and interface design
   - Performance characteristics and optimizations
   - Integration capabilities and extensibility
   - Security features and compliance
   - Scalability and reliability aspects

3. **SWOT Analysis** (Comprehensive):
   - **Strengths** (6-8 items): Technical excellence, innovation, community, market position
   - **Weaknesses** (4-6 items): Technical limitations, resource constraints, market challenges
   - **Opportunities** (6-8 items): Growth potential, market expansion, technology trends
   - **Threats** (4-6 items): Competition, technology risks, market changes

4. **Technical Deep Dive** (4-6 paragraphs):
   - Architecture and design patterns analysis
   - Code quality and maintainability assessment
   - Performance characteristics and optimization strategies
   - Security implementation and best practices
   - Technology stack evaluation and rationale
   - Development practices and methodologies

5. **Business Value & Market Analysis** (3-4 paragraphs):
   - Commercial potential and market opportunity
   - ROI analysis and cost-benefit assessment
   - Competitive landscape and positioning
   - Revenue models and monetization potential
   - Strategic partnerships and ecosystem integration

6. **Social Impact & Innovation Assessment** (2-3 paragraphs):
   - Societal benefits and positive impact
   - Innovation level and technological advancement
   - Contribution to open-source ecosystem
   - Educational and knowledge-sharing value
   - Environmental and sustainability considerations

7. **Community & Adoption Metrics** (2-3 paragraphs):
   - Community health and engagement analysis
   - Adoption trends and growth patterns
   - Contributor diversity and sustainability
   - Documentation quality and accessibility
   - Support ecosystem and resources

8. **Strategic Recommendations** (8-12 actionable items):
   - Technical improvement priorities
   - Business development opportunities
   - Community growth strategies
   - Risk mitigation approaches
   - Innovation and R&D directions
   - Partnership and collaboration opportunities
   - Market expansion strategies
   - Sustainability and long-term planning

9. **Future Roadmap & Potential** (2-3 paragraphs):
   - Technology evolution and adaptation
   - Market trends alignment
   - Scalability and growth projections
   - Innovation pipeline and R&D opportunities
   - Long-term sustainability assessment

${customSectionPrompts ? `\n**Custom Sections:**\n${customSectionPrompts}` : ''}

**Response Format (JSON):**
{
  "summary": "Comprehensive executive summary focusing on value, innovation, and impact...",
  "features": ["Feature 1 with detailed explanation", "Feature 2 with technical depth", ...],
  "swotAnalysis": {
    "strengths": ["Detailed strength 1", "Detailed strength 2", ...],
    "weaknesses": ["Specific weakness 1", "Specific weakness 2", ...],
    "opportunities": ["Strategic opportunity 1", "Market opportunity 2", ...],
    "threats": ["Competitive threat 1", "Technology risk 2", ...]
  },
  "technicalOverview": "Comprehensive technical analysis covering architecture, code quality, performance...",
  "businessValue": "Detailed business value and market analysis...",
  "socialImpact": "Analysis of societal benefits and innovation contribution...",
  "communityMetrics": "Community health, adoption trends, and engagement analysis...",
  "recommendations": ["Strategic recommendation 1", "Technical improvement 2", ...],
  "futureRoadmap": "Future potential, roadmap, and long-term sustainability analysis...",
  "innovationScore": 8.5,
  "marketPotential": "High/Medium/Low with detailed justification",
  "technicalComplexity": "Advanced/Intermediate/Basic with explanation",
  "adoptionReadiness": "Production-ready/Beta/Alpha with assessment"${
    customSections.length > 0
      ? ',\n  "customSections": {\n' +
        customSections
          .filter((s) => s.enabled)
          .map((s) => `    "${s.id}": "Comprehensive analysis for ${s.name}..."`)
          .join(',\n') +
        '\n  }'
      : ''
  }
}

**CRITICAL REQUIREMENTS:**
- Respond with valid JSON only
- Escape all special characters properly
- Provide specific, actionable insights rather than generic statements
- Include concrete examples and evidence-based assessments
- Maintain consistency with the specified tone and audience
- Focus on real value creation and practical applications
- Avoid mentioning stars/forks unless they're genuinely significant (>1000)
- Emphasize technical merit, innovation, and actual impact over popularity metrics
- Provide forward-looking analysis and strategic insights
- Ensure all sections are comprehensive, detailed, and professionally written
`;
};

/**
 * Build comprehensive repository context for AI analysis
 */
const buildRepositoryContext = (repository: Repository | EnhancedRepository): string => {
  const enhancedRepo = repository as EnhancedRepository;
  
  let context = `
**Repository Overview:**
- Name: ${repository.name}
- Description: ${repository.description || 'No description provided'}
- Primary Language: ${repository.language || 'Multiple languages'}
- Repository Size: ${formatBytes(repository.size * 1024)}
- Created: ${formatDate(repository.created_at)}
- Last Updated: ${formatDate(repository.updated_at)}
- Topics: ${repository.topics.join(', ') || 'None specified'}
- License: ${repository.license?.name || 'Not specified'}
- Open Issues: ${repository.open_issues_count}
- Has Wiki: ${repository.has_wiki ? 'Yes' : 'No'}
- Archived: ${repository.archived ? 'Yes' : 'No'}
`;

  // Add enhanced data if available
  if (enhancedRepo.readme) {
    context += `
**README Analysis:**
${enhancedRepo.readme.substring(0, 2000)}${enhancedRepo.readme.length > 2000 ? '...' : ''}
`;
  }

  if (enhancedRepo.languages) {
    const totalBytes = Object.values(enhancedRepo.languages).reduce((sum, bytes) => sum + bytes, 0);
    const languageBreakdown = Object.entries(enhancedRepo.languages)
      .map(([lang, bytes]) => `${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`)
      .join(', ');
    
    context += `
**Language Distribution:**
${languageBreakdown}
`;
  }

  if (enhancedRepo.codeStructure) {
    context += `
**Code Structure Analysis:**
- Total Files: ${enhancedRepo.codeStructure.files.length}
- Directories: ${enhancedRepo.codeStructure.directories.length}
- Main Files: ${enhancedRepo.codeStructure.mainFiles.join(', ') || 'None identified'}
- Config Files: ${enhancedRepo.codeStructure.configFiles.join(', ') || 'None'}
- Test Files: ${enhancedRepo.codeStructure.testFiles.join(', ') || 'None'}
`;
  }

  if (enhancedRepo.dependencies) {
    context += `
**Dependencies Analysis:**
- Total Dependencies: ${enhancedRepo.dependencies.total}
- Production Dependencies: ${enhancedRepo.dependencies.production.length}
- Development Dependencies: ${enhancedRepo.dependencies.development.length}
`;
  }

  if (enhancedRepo.codeMetrics) {
    context += `
**Code Quality Metrics:**
- Estimated Lines of Code: ${enhancedRepo.codeMetrics.linesOfCode.toLocaleString()}
- Complexity Score: ${enhancedRepo.codeMetrics.complexity}/10
- Maintainability Index: ${enhancedRepo.codeMetrics.maintainabilityIndex}/100
${enhancedRepo.codeMetrics.testCoverage ? `- Test Coverage: ${enhancedRepo.codeMetrics.testCoverage}%` : ''}
`;
  }

  if (enhancedRepo.communityMetrics) {
    context += `
**Community Health Metrics:**
- Active Contributors: ${enhancedRepo.communityMetrics.activeContributors}
- Average Issue Response Time: ${enhancedRepo.communityMetrics.issueResponseTime} days
- Average PR Merge Time: ${enhancedRepo.communityMetrics.prMergeTime} days
- Community Health Score: ${enhancedRepo.communityMetrics.communityHealth}/100
`;
  }

  if (enhancedRepo.projectInsights) {
    context += `
**Project Insights:**
- Purpose: ${enhancedRepo.projectInsights.purpose}
- Target Audience: ${enhancedRepo.projectInsights.targetAudience}
- Problem Solved: ${enhancedRepo.projectInsights.problemSolved}
- Unique Value: ${enhancedRepo.projectInsights.uniqueValue}
- Technical Approach: ${enhancedRepo.projectInsights.technicalApproach}
- Innovation Level: ${enhancedRepo.projectInsights.innovationLevel}/10
- Social Impact: ${enhancedRepo.projectInsights.socialImpact}
- Business Value: ${enhancedRepo.projectInsights.businessValue}
`;
  }

  if (enhancedRepo.commits && enhancedRepo.commits.length > 0) {
    const recentCommits = enhancedRepo.commits.slice(0, 5);
    const commitFrequency = enhancedRepo.commits.length;
    context += `
**Development Activity:**
- Total Commits Analyzed: ${commitFrequency}
- Recent Commit Activity: ${recentCommits.length} recent commits
- Development Velocity: ${commitFrequency > 100 ? 'High' : commitFrequency > 50 ? 'Moderate' : 'Low'}
`;
  }

  if (enhancedRepo.releases && enhancedRepo.releases.length > 0) {
    context += `
**Release Management:**
- Total Releases: ${enhancedRepo.releases.length}
- Latest Release: ${enhancedRepo.releases[0]?.tag_name || 'N/A'}
- Release Frequency: ${enhancedRepo.releases.length > 10 ? 'High' : enhancedRepo.releases.length > 5 ? 'Moderate' : 'Low'}
`;
  }

  return context;
};

/**
 * Parse and validate the AI response with enhanced error handling
 */
const parseAdvancedAIResponse = (
  response: string,
  repository: Repository,
  aiTone: AITone,
  customSections: CustomSection[]
): AIContent => {
  try {
    // Clean the response first
    const cleanedResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    // Validate and sanitize the response
    const result: AIContent = {
      summary:
        sanitizeText(parsed.summary) ||
        `Comprehensive analysis of ${repository.name} - a ${repository.language || 'multi-technology'} project that demonstrates technical excellence and innovation in software development.`,
      features: Array.isArray(parsed.features)
        ? parsed.features.map(sanitizeText).filter(Boolean)
        : [],
      swotAnalysis: {
        strengths: Array.isArray(parsed.swotAnalysis?.strengths)
          ? parsed.swotAnalysis.strengths.map(sanitizeText).filter(Boolean)
          : [],
        weaknesses: Array.isArray(parsed.swotAnalysis?.weaknesses)
          ? parsed.swotAnalysis.weaknesses.map(sanitizeText).filter(Boolean)
          : [],
        opportunities: Array.isArray(parsed.swotAnalysis?.opportunities)
          ? parsed.swotAnalysis.opportunities.map(sanitizeText).filter(Boolean)
          : [],
        threats: Array.isArray(parsed.swotAnalysis?.threats)
          ? parsed.swotAnalysis.threats.map(sanitizeText).filter(Boolean)
          : [],
      },
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map(sanitizeText).filter(Boolean)
        : [],
      technicalOverview:
        sanitizeText(parsed.technicalOverview) ||
        `${repository.name} demonstrates sophisticated technical implementation with modern ${repository.language || 'multi-language'} architecture, emphasizing code quality, performance optimization, and scalable design patterns.`,
      businessValue:
        sanitizeText(parsed.businessValue) ||
        `This project provides significant business value through innovative technology solutions, addressing real-world challenges and creating opportunities for growth and competitive advantage.`,
      socialImpact:
        sanitizeText(parsed.socialImpact) ||
        `${repository.name} contributes to the broader software development ecosystem by providing valuable tools and knowledge that benefit developers and end-users alike.`,
      communityMetrics:
        sanitizeText(parsed.communityMetrics) ||
        `The project demonstrates healthy community engagement with active development and collaborative contribution patterns.`,
      futureRoadmap:
        sanitizeText(parsed.futureRoadmap) ||
        `Future development opportunities include enhanced features, expanded integrations, and continued innovation in ${repository.language || 'technology'} development.`,
      innovationScore: parsed.innovationScore || 7.5,
      marketPotential: parsed.marketPotential || 'Medium - Shows promise for continued growth and adoption',
      technicalComplexity: parsed.technicalComplexity || 'Intermediate - Well-structured with room for advanced features',
      adoptionReadiness: parsed.adoptionReadiness || 'Production-ready - Suitable for real-world implementation'
    };

    // Add custom sections if they exist
    if (parsed.customSections && customSections.length > 0) {
      result.customSections = {};
      customSections.forEach((section) => {
        if (section.enabled && parsed.customSections[section.id]) {
          result.customSections![section.id] = sanitizeText(
            parsed.customSections[section.id]
          );
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return generateAdvancedMockAIContent(repository, aiTone, customSections);
  }
};

/**
 * Generate sophisticated mock data with comprehensive analysis
 */
const generateAdvancedMockAIContent = (
  repository: Repository,
  aiTone: AITone,
  customSections: CustomSection[]
): AIContent => {
  const enhancedRepo = repository as EnhancedRepository;
  const now = new Date();
  const createdDate = new Date(repository.created_at);
  const ageInMonths =
    (now.getFullYear() - createdDate.getFullYear()) * 12 +
    (now.getMonth() - createdDate.getMonth());

  const projectPurpose = enhancedRepo.projectInsights?.purpose || 
    `A ${repository.language || 'multi-technology'} solution designed to address specific challenges in software development`;
  
  const technicalApproach = enhancedRepo.projectInsights?.technicalApproach ||
    `Built with ${repository.language || 'modern technologies'} using industry best practices`;

  const styleVariations = {
    professional: {
      summary: `${repository.name} represents a sophisticated ${repository.language || 'multi-technology'} solution that demonstrates exceptional technical merit and strategic value. ${projectPurpose}. Over its ${ageInMonths}-month development lifecycle, the project has evolved into a robust, well-architected system that addresses critical industry needs. The implementation showcases advanced software engineering principles, including modular design, comprehensive testing strategies, and performance optimization. ${technicalApproach}, ensuring scalability, maintainability, and enterprise-grade reliability. The project's technical excellence is evidenced by its clean codebase architecture, thoughtful API design, and adherence to industry standards. This solution provides measurable business value through improved operational efficiency, reduced development costs, and enhanced system reliability, positioning it as a strategic asset for organizations seeking to modernize their technology infrastructure.`,
      
      features: [
        'Enterprise-grade modular architecture enabling seamless component integration and reusability',
        'Comprehensive API design with RESTful principles and robust error handling mechanisms',
        'Advanced performance optimization including caching strategies and resource management',
        'Scalable infrastructure design supporting horizontal and vertical scaling requirements',
        'Security-first implementation with encryption, authentication, and authorization frameworks',
        'Automated testing suite with unit, integration, and end-to-end test coverage',
        'Continuous integration and deployment pipeline ensuring consistent quality delivery',
        'Comprehensive documentation including technical specifications and user guides',
        'Cross-platform compatibility and responsive design principles',
        'Real-time monitoring and logging capabilities for operational excellence',
        'Extensible plugin architecture enabling third-party integrations',
        'Data analytics and reporting features for business intelligence insights'
      ],
    },
    
    casual: {
      summary: `${repository.name} is a really well-thought-out project that's been in development for about ${ageInMonths} months. ${projectPurpose.toLowerCase()}. What makes this project special is how the developers have approached the problem - they've built something that's not just functional, but actually enjoyable to use. The codebase is clean and well-organized, making it easy for new contributors to jump in and start helping out. ${technicalApproach.toLowerCase()}, and you can tell the team really cares about code quality and user experience. The project has grown organically with the community, adding features that people actually need rather than just cool tech for the sake of it. It's the kind of project that makes you think "why didn't someone build this sooner?" - simple in concept but sophisticated in execution.`,
      
      features: [
        'Super intuitive interface that just makes sense from the moment you start using it',
        'Really solid codebase that\'s easy to understand and contribute to',
        'Automated testing that actually works and catches issues before they become problems',
        'Great documentation with examples that help you get started quickly',
        'Flexible architecture that adapts to different use cases without breaking',
        'Active community that welcomes newcomers and helps with questions',
        'Regular updates and improvements based on user feedback',
        'Cross-platform support so it works wherever you need it',
        'Performance optimizations that make everything feel snappy and responsive',
        'Built-in security features that protect your data without getting in the way',
        'Plugin system that lets you extend functionality without modifying core code',
        'Helpful error messages that actually tell you what went wrong and how to fix it'
      ],
    },
    
    technical: {
      summary: `${repository.name} implements a sophisticated ${repository.language || 'polyglot'} architecture demonstrating advanced software engineering principles and cutting-edge development practices. The system architecture follows Domain-Driven Design (DDD) patterns with clear separation of concerns, implementing SOLID principles throughout the codebase. ${projectPurpose}. The technical implementation leverages ${repository.language || 'modern programming languages'} with emphasis on type safety, memory efficiency, and concurrent processing capabilities. The codebase demonstrates mastery of design patterns including Factory, Observer, Strategy, and Dependency Injection, resulting in highly maintainable and testable code. Performance optimization strategies include lazy loading, connection pooling, caching layers, and asynchronous processing pipelines. The system architecture supports microservices decomposition with API-first design, enabling horizontal scalability and fault tolerance. Security implementation follows OWASP guidelines with comprehensive input validation, secure authentication protocols, and encrypted data transmission.`,
      
      features: [
        'Microservices architecture with service mesh implementation for inter-service communication',
        'Event-driven architecture using message queues and publish-subscribe patterns',
        'Comprehensive type system with static analysis and compile-time error detection',
        'Advanced caching strategies including Redis integration and CDN optimization',
        'Database optimization with query performance tuning and connection pooling',
        'Containerized deployment with Docker and Kubernetes orchestration support',
        'CI/CD pipeline with automated testing, code quality gates, and deployment automation',
        'Monitoring and observability with distributed tracing and metrics collection',
        'API versioning and backward compatibility management',
        'Load balancing and auto-scaling capabilities for high availability',
        'Security hardening with OAuth 2.0, JWT tokens, and rate limiting',
        'Code quality enforcement with linting, formatting, and complexity analysis'
      ],
    },
    
    executive: {
      summary: `${repository.name} represents a strategic technology investment that delivers measurable business value and competitive advantage in the ${repository.language || 'technology'} market segment. ${projectPurpose}, addressing a critical market need with an estimated total addressable market (TAM) of significant scale. The solution demonstrates strong product-market fit through its technical innovation and user-centric design approach. Over ${ageInMonths} months of development, the project has achieved key milestones in technology maturation, market validation, and operational readiness. The platform's architecture enables rapid scaling and market expansion while maintaining cost-effective operations. Key performance indicators show positive trends in user adoption, system reliability, and operational efficiency. The technology stack provides sustainable competitive advantages through proprietary algorithms, optimized performance characteristics, and comprehensive feature sets. This investment positions the organization for market leadership while generating substantial ROI through reduced operational costs, improved productivity metrics, and new revenue opportunities.`,
      
      features: [
        'Scalable business model with multiple revenue streams and market expansion opportunities',
        'Competitive differentiation through proprietary technology and innovative feature sets',
        'Cost optimization strategies reducing operational expenses by up to 40%',
        'Market-leading performance metrics exceeding industry benchmarks',
        'Strategic partnership integration capabilities enabling ecosystem expansion',
        'Compliance framework supporting enterprise and regulatory requirements',
        'Data-driven insights and analytics for informed business decision making',
        'Risk mitigation through redundancy, backup systems, and disaster recovery',
        'Intellectual property portfolio with potential for licensing and monetization',
        'Global market readiness with internationalization and localization support',
        'Customer success metrics showing high satisfaction and retention rates',
        'Future-proof architecture supporting emerging technology integration'
      ],
    },
    
    academic: {
      summary: `${repository.name} represents a significant contribution to the field of ${repository.language || 'computer science'} research and practical software engineering. This work demonstrates the application of theoretical computer science principles to real-world problem-solving, bridging the gap between academic research and industry implementation. ${projectPurpose}, following established methodologies documented in peer-reviewed literature. The implementation adheres to software engineering best practices as outlined in foundational texts by Sommerville, Pressman, and McConnell, while incorporating contemporary research findings in software architecture and design patterns. The project's technical approach aligns with current research trends in distributed systems, as evidenced by recent publications in ACM and IEEE conferences. The codebase serves as a practical demonstration of concepts from software engineering research, including formal verification methods, automated testing strategies, and empirical software engineering practices. This work contributes to the open-source ecosystem while providing a foundation for future research in applied computer science.`,
      
      features: [
        'Implementation of peer-reviewed algorithms and data structures from computer science literature',
        'Empirical validation of software engineering methodologies through measurable metrics',
        'Formal specification and verification of critical system components',
        'Research-backed design patterns and architectural decisions with academic citations',
        'Comprehensive documentation suitable for academic study and peer review',
        'Reproducible research methodology with version control and experimental protocols',
        'Statistical analysis of performance characteristics and system behavior',
        'Contribution to open science initiatives and knowledge sharing platforms',
        'Integration of theoretical concepts with practical implementation challenges',
        'Benchmarking against established baselines from academic literature',
        'Collaborative research framework enabling multi-institutional contributions',
        'Educational value for computer science curriculum and research training'
      ],
    },
  };

  const variation = styleVariations[aiTone.style] || styleVariations.professional;

  const result: AIContent = {
    ...variation,
    swotAnalysis: {
      strengths: [
        `Innovative technical approach using ${repository.language || 'modern technologies'} with advanced implementation patterns`,
        `Strong architectural foundation demonstrating scalability and maintainability principles`,
        `Comprehensive development practices including automated testing and continuous integration`,
        `Well-documented codebase facilitating knowledge transfer and community contribution`,
        `Active development lifecycle with consistent updates and feature enhancements`,
        `Security-conscious implementation following industry best practices and standards`,
        `Performance-optimized design with efficient resource utilization and response times`,
        `Cross-platform compatibility ensuring broad accessibility and adoption potential`
      ],
      weaknesses: [
        `Limited market visibility requiring enhanced marketing and community outreach strategies`,
        `Dependency management complexity potentially impacting long-term maintenance overhead`,
        `Documentation gaps in advanced configuration and customization scenarios`,
        `Resource constraints limiting rapid feature development and expansion capabilities`,
        `Learning curve for new contributors requiring comprehensive onboarding processes`
      ],
      opportunities: [
        `Market expansion through enterprise adoption and commercial licensing opportunities`,
        `Technology integration with emerging platforms and cloud-native ecosystems`,
        `Community growth through developer advocacy and educational content creation`,
        `Partnership development with complementary technology providers and platforms`,
        `Feature enhancement based on user feedback and market demand analysis`,
        `Open-source ecosystem contribution increasing visibility and adoption rates`,
        `Research collaboration opportunities with academic institutions and industry leaders`,
        `International market penetration through localization and regional partnerships`
      ],
      threats: [
        `Competitive pressure from established market players with greater resources`,
        `Technology obsolescence risks requiring continuous innovation and adaptation`,
        `Security vulnerabilities potentially impacting user trust and adoption`,
        `Regulatory changes affecting compliance requirements and operational procedures`,
        `Key person dependencies creating knowledge concentration and succession risks`,
        `Economic downturns potentially reducing investment in new technology adoption`
      ],
    },
    recommendations: [
      'Implement comprehensive security audit and penetration testing to ensure robust protection against emerging threats',
      'Develop strategic partnerships with industry leaders to accelerate market adoption and ecosystem integration',
      'Enhance documentation with interactive tutorials, video content, and comprehensive API references',
      'Establish formal community governance model with clear contribution guidelines and recognition programs',
      'Create performance benchmarking suite with automated monitoring and optimization recommendations',
      'Develop enterprise support offerings including professional services and training programs',
      'Implement advanced analytics and telemetry to understand usage patterns and optimization opportunities',
      'Establish continuous security monitoring with automated vulnerability scanning and remediation',
      'Create comprehensive testing strategy including load testing, security testing, and compatibility validation',
      'Develop roadmap for emerging technology integration including AI/ML capabilities and cloud-native features',
      'Implement internationalization framework to support global market expansion',
      'Establish thought leadership through conference presentations, technical publications, and community engagement'
    ],
    technicalOverview: `${repository.name} demonstrates sophisticated software engineering practices through its implementation of modern ${repository.language || 'programming'} paradigms and architectural patterns. The system architecture follows microservices principles with clear service boundaries, enabling independent scaling and deployment of individual components. The codebase exhibits high-quality engineering practices including comprehensive unit testing, integration testing, and end-to-end validation suites. Performance optimization strategies include efficient algorithms, optimized data structures, and intelligent caching mechanisms that ensure responsive user experiences under varying load conditions. Security implementation follows defense-in-depth principles with multiple layers of protection including input validation, authentication, authorization, and encrypted communications. The development workflow incorporates continuous integration and deployment practices with automated quality gates, ensuring consistent code quality and reliable releases. Database design demonstrates normalization principles with optimized query patterns and appropriate indexing strategies. The API design follows RESTful principles with comprehensive error handling, rate limiting, and versioning support for backward compatibility.`,
    businessValue: `${repository.name} delivers substantial business value through its innovative approach to ${repository.language || 'technology'} implementation and problem-solving. The solution addresses critical market needs while providing cost-effective alternatives to existing solutions, resulting in significant total cost of ownership (TCO) reductions for adopting organizations. The platform's scalable architecture enables rapid business growth without proportional infrastructure cost increases, providing excellent return on investment (ROI) characteristics. Market analysis indicates strong demand for solutions in this category, with the project positioned to capture significant market share through its technical differentiation and competitive pricing model. The open-source nature of the project reduces licensing costs while providing transparency and customization capabilities that enterprise customers value. Strategic partnerships and ecosystem integrations create additional revenue opportunities through complementary services and support offerings. The project's technical excellence and innovation potential position it as a valuable intellectual property asset with opportunities for commercialization and licensing.`,
    socialImpact: `${repository.name} contributes significantly to the broader technology ecosystem and society through its open-source approach and innovative solutions. The project democratizes access to advanced ${repository.language || 'technology'} capabilities, enabling smaller organizations and individual developers to leverage enterprise-grade functionality without prohibitive costs. Educational institutions benefit from the project's comprehensive documentation and real-world implementation examples, providing valuable learning resources for students and researchers. The open-source model fosters collaboration and knowledge sharing across the global developer community, accelerating innovation and best practice adoption. Environmental benefits include optimized resource utilization and energy-efficient algorithms that reduce computational overhead and carbon footprint. The project's accessibility features and inclusive design principles ensure broad usability across diverse user populations. Community contributions and collaborative development model create opportunities for skill development and career advancement for participating developers. The project's impact extends beyond immediate users to influence industry standards and best practices in ${repository.language || 'software'} development.`,
    communityMetrics: `The project demonstrates healthy community engagement patterns with active participation from diverse contributors and stakeholders. Development velocity remains consistent with regular commits, feature additions, and bug fixes indicating sustained maintainer engagement and community interest. Issue resolution patterns show responsive community support with average response times meeting industry standards for open-source projects. Contributor diversity includes participants from multiple geographic regions and organizational backgrounds, reducing key person dependencies and ensuring project sustainability. Documentation quality and accessibility facilitate new contributor onboarding and knowledge transfer. Community governance structures provide clear guidelines for contribution, decision-making, and conflict resolution. The project maintains active communication channels including forums, chat platforms, and regular community meetings that foster collaboration and knowledge sharing.`,
    futureRoadmap: `The future development trajectory for ${repository.name} includes several strategic initiatives designed to enhance functionality, expand market reach, and ensure long-term sustainability. Technical roadmap priorities include performance optimization, security enhancements, and integration with emerging technologies such as artificial intelligence and machine learning capabilities. Market expansion opportunities include enterprise feature development, cloud-native optimizations, and mobile platform support. Community growth initiatives focus on contributor onboarding, documentation enhancement, and educational content creation. Strategic partnerships with technology vendors and service providers will accelerate adoption and create new integration opportunities. Research and development investments will explore cutting-edge technologies and innovative approaches to maintain competitive advantage. Sustainability planning includes governance model evolution, funding strategy development, and succession planning for key maintainers. The project's architecture and design principles position it well for adaptation to future technology trends and market requirements.`,
    innovationScore: calculateInnovationScore(repository, enhancedRepo),
    marketPotential: assessMarketPotential(repository, enhancedRepo),
    technicalComplexity: assessTechnicalComplexity(repository, enhancedRepo),
    adoptionReadiness: assessAdoptionReadiness(repository, enhancedRepo)
  };

  // Add custom sections if they exist
  if (customSections.length > 0) {
    result.customSections = {};
    customSections.forEach((section) => {
      if (section.enabled) {
        result.customSections![section.id] = generateAdvancedCustomSectionContent(
          section,
          repository,
          aiTone,
          enhancedRepo
        );
      }
    });
  }

  return result;
};

/**
 * Calculate innovation score based on multiple factors
 */
const calculateInnovationScore = (repository: Repository, enhancedRepo?: EnhancedRepository): number => {
  let score = 5.0; // Base score
  
  // Technology innovation
  const innovativeTechnologies = ['ai', 'ml', 'blockchain', 'quantum', 'webassembly', 'rust', 'go'];
  const modernTechnologies = ['react', 'vue', 'angular', 'node', 'python', 'typescript'];
  
  const topics = repository.topics.map(t => t.toLowerCase());
  score += topics.filter(topic => innovativeTechnologies.includes(topic)).length * 1.5;
  score += topics.filter(topic => modernTechnologies.includes(topic)).length * 0.5;
  
  // Project age factor (newer projects might be more innovative)
  const ageInYears = (Date.now() - new Date(repository.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (ageInYears < 2) score += 1.0;
  else if (ageInYears < 5) score += 0.5;
  
  // Enhanced repository factors
  if (enhancedRepo?.projectInsights) {
    score += enhancedRepo.projectInsights.innovationLevel * 0.3;
  }
  
  // Code quality indicators
  if (enhancedRepo?.codeStructure?.testFiles.length ?? 0) score += 0.5;
  if (enhancedRepo?.dependencies?.total ?? 20) score += 0.3; // Complex projects might be more innovative
  
  return Math.min(10.0, Math.max(1.0, score));
};

/**
 * Assess market potential
 */
const assessMarketPotential = (repository: Repository, _enhancedRepo?: EnhancedRepository): string => {
  const topics = repository.topics.map(t => t.toLowerCase());
  const highDemandAreas = ['api', 'web', 'mobile', 'cloud', 'ai', 'data', 'security'];
  const emergingAreas = ['blockchain', 'iot', 'edge', 'quantum'];
  
  const hasHighDemand = topics.some(topic => highDemandAreas.includes(topic));
  const hasEmergingTech = topics.some(topic => emergingAreas.includes(topic));
  
  if (hasEmergingTech) {
    return 'High - Positioned in emerging technology markets with significant growth potential';
  } else if (hasHighDemand) {
    return 'High - Addresses established market needs with proven demand';
  } else if (repository.language && ['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust'].includes(repository.language)) {
    return 'Medium - Built with popular technologies indicating good market alignment';
  } else {
    return 'Medium - Solid technical foundation with potential for market development';
  }
};

/**
 * Assess technical complexity
 */
const assessTechnicalComplexity = (repository: Repository, enhancedRepo?: EnhancedRepository): string => {
  let complexityScore = 0;
  
  // Language complexity
  const complexLanguages = ['C++', 'Rust', 'Haskell', 'Scala', 'Assembly'];
  const moderateLanguages = ['Java', 'C#', 'Go', 'TypeScript'];
  
  if (repository.language && complexLanguages.includes(repository.language)) {
    complexityScore += 3;
  } else if (repository.language && moderateLanguages.includes(repository.language)) {
    complexityScore += 2;
  } else {
    complexityScore += 1;
  }
  
  // Project size
  if (repository.size > 10000) complexityScore += 2;
  else if (repository.size > 1000) complexityScore += 1;
  
  // Topics complexity
  const complexTopics = ['microservices', 'distributed', 'concurrent', 'parallel'];
  complexityScore += repository.topics.filter(topic => 
    complexTopics.includes(topic.toLowerCase())
  ).length;
  
  // Enhanced metrics
  if (enhancedRepo?.codeMetrics?.complexity) {
    complexityScore += enhancedRepo.codeMetrics.complexity / 3;
  }
  
  if (complexityScore >= 6) {
    return 'Advanced - Sophisticated architecture requiring specialized expertise';
  } else if (complexityScore >= 3) {
    return 'Intermediate - Well-structured with moderate complexity';
  } else {
    return 'Basic - Straightforward implementation suitable for general development';
  }
};

/**
 * Assess adoption readiness
 */
const assessAdoptionReadiness = (repository: Repository, enhancedRepo?: EnhancedRepository): string => {
  let readinessScore = 0;
  
  // Documentation
  if (enhancedRepo?.readme && enhancedRepo.readme.length > 1000) readinessScore += 2;
  else if (enhancedRepo?.readme && enhancedRepo.readme.length > 500) readinessScore += 1;
  
  // Testing
  if (enhancedRepo?.codeStructure?.testFiles.length ?? 0) readinessScore += 2;
  
  // Configuration
  if (enhancedRepo?.codeStructure?.configFiles.length ?? 0) readinessScore += 1;
  
  // License
  if (repository.license) readinessScore += 1;
  
  // Recent activity
  const daysSinceUpdate = (Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 30) readinessScore += 2;
  else if (daysSinceUpdate < 90) readinessScore += 1;
  
  // Releases
  if (enhancedRepo?.releases && enhancedRepo.releases.length > 0) readinessScore += 1;
  
  if (readinessScore >= 7) {
    return 'Production-ready - Comprehensive documentation, testing, and maintenance';
  } else if (readinessScore >= 4) {
    return 'Beta - Good foundation with some areas needing enhancement';
  } else {
    return 'Alpha - Early stage requiring significant development before production use';
  }
};

/**
 * Generate advanced content for custom sections
 */
const generateAdvancedCustomSectionContent = (
  section: CustomSection,
  repository: Repository,
  aiTone: AITone,
  _enhancedRepo?: EnhancedRepository
): string => {
  const templates = {
    architecture: `The ${repository.name} project implements a sophisticated ${repository.language || 'multi-technology'} architecture that demonstrates mastery of modern software design principles. The system follows a layered architecture pattern with clear separation of concerns, implementing Domain-Driven Design (DDD) principles throughout the codebase. The architectural foundation includes well-defined service boundaries, dependency injection patterns, and event-driven communication mechanisms. Key architectural decisions prioritize scalability, maintainability, and testability, with comprehensive abstraction layers that enable independent component evolution. The implementation leverages ${repository.language || 'modern programming languages'} idioms and best practices, including SOLID principles, design patterns, and clean code methodologies. Performance considerations are embedded throughout the architecture with optimized data access patterns, efficient caching strategies, and asynchronous processing capabilities. The system design supports horizontal scaling through stateless service design and distributed processing capabilities.`,

    performance: `Performance analysis of ${repository.name} reveals a highly optimized implementation with sophisticated performance engineering throughout the system. The application demonstrates excellent resource utilization characteristics with efficient memory management, optimized CPU usage patterns, and minimal I/O overhead. Benchmarking indicates strong performance characteristics under typical workloads with linear scaling properties and predictable resource consumption patterns. The implementation includes advanced caching strategies with multi-level cache hierarchies, intelligent cache invalidation, and distributed caching support for horizontal scaling scenarios. Database performance optimization includes query optimization, connection pooling, and efficient data access patterns that minimize latency and maximize throughput. Asynchronous processing capabilities enable non-blocking operations and improved system responsiveness under high load conditions. Load testing results demonstrate system stability and performance consistency across varying traffic patterns and usage scenarios.`,

    security: `Security assessment of ${repository.name} demonstrates comprehensive implementation of defense-in-depth security principles and industry best practices. The security architecture includes multiple layers of protection with robust authentication mechanisms, fine-grained authorization controls, and comprehensive input validation frameworks. Cryptographic implementations follow current standards with proper key management, secure random number generation, and appropriate encryption algorithms for data protection. The system implements comprehensive audit logging, security monitoring, and intrusion detection capabilities that enable rapid threat identification and response. Vulnerability management processes include regular security assessments, dependency scanning, and automated security testing integration within the development pipeline. Compliance considerations address relevant regulatory requirements with appropriate controls for data privacy, access management, and audit trail maintenance. Security hardening measures include secure configuration management, network security controls, and runtime protection mechanisms.`,

    dependencies: `Dependency analysis reveals a well-managed ecosystem with strategic selection of ${repository.language || 'technology'} libraries and frameworks. The project maintains a balanced approach to dependency management with careful evaluation of third-party components for security, performance, and maintenance considerations. License compatibility has been thoroughly verified across all dependencies with appropriate legal review and compliance documentation. The dependency graph demonstrates minimal circular dependencies and clear separation of concerns with appropriate abstraction layers. Version management strategies include automated dependency updates, security vulnerability monitoring, and compatibility testing across dependency versions. The project implements dependency injection patterns that enable flexible component substitution and testing isolation. Risk mitigation strategies include dependency pinning, alternative library evaluation, and contingency planning for critical dependency maintenance issues.`,

    innovation: `Innovation analysis of ${repository.name} reveals significant technological advancement and creative problem-solving approaches within the ${repository.language || 'software development'} domain. The project introduces novel algorithms, optimization techniques, and architectural patterns that advance the state-of-the-art in relevant technology areas. Research and development efforts demonstrate deep understanding of theoretical foundations combined with practical implementation expertise. The innovation extends beyond technical implementation to include user experience design, developer experience optimization, and ecosystem integration approaches. Intellectual property considerations include potential patent opportunities, trade secret protection, and open-source contribution strategies. The project's innovative approaches have potential for broader industry adoption and standardization efforts. Future innovation roadmap includes emerging technology integration, research collaboration opportunities, and continued advancement of core technological capabilities.`,

    scalability: `Scalability analysis of ${repository.name} demonstrates sophisticated design for growth with comprehensive horizontal and vertical scaling capabilities. The architecture implements stateless design principles that enable seamless horizontal scaling across distributed infrastructure environments. Load balancing strategies include intelligent request routing, session affinity management, and automatic failover capabilities that ensure high availability under varying load conditions. Database scaling approaches include read replica support, sharding strategies, and caching layers that maintain performance characteristics as data volume grows. The system design accommodates microservices decomposition with service mesh integration, API gateway patterns, and distributed transaction management. Performance monitoring and auto-scaling capabilities enable dynamic resource allocation based on real-time demand patterns. Capacity planning methodologies include load testing, performance modeling, and resource utilization analysis that inform scaling decisions and infrastructure investments.`
  };

  const baseTemplate = templates[section.id as keyof typeof templates];
  
  if (baseTemplate) {
    return baseTemplate;
  }

  // Generate custom content based on section type and AI tone
  const toneModifiers = {
    professional: 'demonstrates professional-grade implementation with enterprise-ready capabilities',
    casual: 'shows thoughtful design that makes complex concepts accessible and user-friendly',
    technical: 'exhibits sophisticated technical implementation with advanced engineering practices',
    executive: 'provides strategic value through innovative technology solutions and competitive advantages',
    academic: 'contributes to the body of knowledge in computer science and software engineering research'
  };

  return `Comprehensive analysis of ${section.name.toLowerCase()} for ${repository.name} reveals a project that ${toneModifiers[aiTone.style]}. The implementation leverages ${repository.language || 'modern technologies'} to address specific challenges in ${section.name.toLowerCase()}, providing innovative solutions that benefit both developers and end-users. Key aspects include strategic technology selection, thoughtful architecture design, and comprehensive consideration of real-world deployment scenarios. The project's approach to ${section.name.toLowerCase()} demonstrates deep understanding of domain-specific requirements combined with practical implementation expertise. Future development opportunities include enhanced capabilities, expanded integration options, and continued innovation in ${repository.language || 'technology'} development practices.`;
};

/**
 * Generate comprehensive insights for multiple repositories
 */
export const generateRepositoryInsights = async (
  repositories: Repository[],
  aiTone: AITone,
  attempt = 0
): Promise<any> => {
  if (!config.apiKey) {
    return generateAdvancedMockInsights(repositories, aiTone);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(
      `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: createAdvancedInsightsPrompt(repositories, aiTone),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: 6144,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No insights generated');
    }

    return JSON.parse(generatedText);
  } catch (error) {
    console.error(`Insights generation attempt ${attempt + 1} failed:`, error);

    if (attempt < config.maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
      return generateRepositoryInsights(repositories, aiTone, attempt + 1);
    }

    return generateAdvancedMockInsights(repositories, aiTone);
  }
};

/**
 * Create advanced insights prompt for multiple repositories
 */
const createAdvancedInsightsPrompt = (
  repositories: Repository[],
  aiTone: AITone
): string => {
  const repoSummary = repositories.map((repo) => ({
    name: repo.name,
    description: repo.description,
    language: repo.language,
    topics: repo.topics,
    size: repo.size,
    created: repo.created_at,
    updated: repo.updated_at,
    license: repo.license?.name
  }));

  return `
You are a senior technology analyst and strategic consultant with expertise in software architecture, market analysis, and technology trends. Analyze the following ${repositories.length} repositories and provide comprehensive strategic insights.

**Repository Portfolio:**
${JSON.stringify(repoSummary, null, 2)}

**Analysis Requirements:**
- Writing Style: ${aiTone.style}
- Target Audience: ${aiTone.audience}
- Focus Areas: ${aiTone.focusAreas.join(', ') || 'Comprehensive analysis'}

Provide deep, strategic analysis in JSON format:
{
  "portfolioOverview": "Comprehensive overview of the technology portfolio and strategic positioning...",
  "technicalExcellence": "Analysis of technical quality, innovation, and engineering practices...",
  "marketPositioning": "Market analysis, competitive landscape, and positioning assessment...",
  "innovationAssessment": "Innovation level, technological advancement, and future potential...",
  "businessValue": "Business value creation, monetization potential, and strategic importance...",
  "riskAnalysis": "Technical, market, and operational risks with mitigation strategies...",
  "growthOpportunities": "Strategic growth opportunities and expansion potential...",
  "competitiveAdvantage": "Unique value propositions and competitive differentiation...",
  "technologyTrends": "Alignment with current and emerging technology trends...",
  "recommendedActions": "Strategic recommendations for portfolio optimization and growth...",
  "portfolioScore": 8.5,
  "marketReadiness": "Assessment of market readiness and adoption potential",
  "strategicPriorities": ["Priority 1", "Priority 2", "Priority 3"]
}

Focus on strategic value, innovation potential, and actionable insights rather than basic metrics.
`;
};

/**
 * Generate advanced mock insights for multiple repositories
 */
const generateAdvancedMockInsights = (
  repositories: Repository[],
  _aiTone: AITone
): any => {
  const languages = [...new Set(repositories.map((repo) => repo.language).filter(Boolean))];
  const totalSize = repositories.reduce((sum, repo) => sum + repo.size, 0);
  const avgAge = repositories.reduce((sum, repo) => {
    const age = (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return sum + age;
  }, 0) / repositories.length;

  const allTopics = repositories.flatMap(repo => repo.topics);
  const topicFrequency = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    portfolioOverview: `This technology portfolio comprises ${repositories.length} repositories spanning ${languages.length} programming languages, representing a diverse and strategically positioned collection of software assets. The portfolio demonstrates technical breadth with ${formatBytes(totalSize * 1024)} of total codebase, averaging ${avgAge.toFixed(1)} months of development maturity per project. The technology stack emphasizes modern development practices with primary focus on ${languages.slice(0, 3).join(', ')} technologies. Strategic positioning indicates strong alignment with current market demands and emerging technology trends, providing a solid foundation for continued growth and innovation.`,

    technicalExcellence: `Technical analysis reveals a portfolio characterized by high engineering standards and sophisticated implementation approaches. The codebase demonstrates consistent application of software engineering best practices including modular architecture, comprehensive testing strategies, and performance optimization. Code quality metrics indicate mature development processes with emphasis on maintainability, scalability, and reliability. The technology choices reflect strategic decision-making with appropriate selection of frameworks, libraries, and development tools. Documentation quality and code organization facilitate knowledge transfer and collaborative development, indicating sustainable development practices.`,

    marketPositioning: `Market analysis positions this portfolio favorably within the competitive landscape, with strong differentiation through technical innovation and comprehensive feature sets. The technology stack aligns with high-demand market segments including ${Object.keys(topicFrequency).slice(0, 3).join(', ')}, indicating excellent market timing and strategic positioning. Competitive advantages include technical sophistication, comprehensive functionality, and strong development practices that exceed industry standards. Market validation is evidenced through technology adoption patterns and alignment with industry best practices.`,

    innovationAssessment: `Innovation analysis reveals significant technological advancement and creative problem-solving approaches throughout the portfolio. The projects demonstrate cutting-edge implementation of ${languages[0] || 'modern'} technologies with novel approaches to common challenges. Innovation extends beyond technical implementation to include user experience design, developer experience optimization, and ecosystem integration strategies. The portfolio's innovation potential is enhanced by its comprehensive technology coverage and strategic technology selection that positions it for future growth and adaptation.`,

    businessValue: `Business value analysis indicates substantial potential for value creation through multiple monetization strategies and market opportunities. The portfolio's technical excellence and comprehensive functionality provide strong foundations for commercial applications, enterprise adoption, and strategic partnerships. Cost-benefit analysis shows favorable ROI characteristics through reduced development costs, improved operational efficiency, and accelerated time-to-market for new initiatives. Strategic value includes intellectual property development, market positioning advantages, and ecosystem integration opportunities.`,

    riskAnalysis: `Risk assessment identifies manageable challenges with comprehensive mitigation strategies available. Technical risks include dependency management complexity and technology evolution requirements, mitigated through strategic architecture decisions and proactive maintenance practices. Market risks include competitive pressure and technology obsolescence, addressed through continuous innovation and market monitoring. Operational risks include maintainer capacity and community sustainability, managed through governance structures and contributor development programs. Overall risk profile is moderate with strong mitigation capabilities.`,

    growthOpportunities: `Growth opportunity analysis reveals multiple vectors for expansion and value creation. Technical growth opportunities include feature enhancement, performance optimization, and integration with emerging technologies. Market growth potential includes enterprise adoption, international expansion, and vertical market penetration. Ecosystem growth includes partnership development, platform integration, and community expansion. Strategic growth opportunities include intellectual property commercialization, consulting services, and technology licensing arrangements.`,

    competitiveAdvantage: `Competitive advantage analysis identifies multiple sources of sustainable differentiation. Technical advantages include superior architecture, comprehensive functionality, and innovative implementation approaches that exceed competitive offerings. Market advantages include strong positioning, excellent timing, and comprehensive technology coverage. Operational advantages include efficient development processes, strong community engagement, and sustainable maintenance practices. These advantages create barriers to competitive entry and provide foundations for market leadership.`,

    technologyTrends: `Technology trend analysis shows excellent alignment with current and emerging market directions. The portfolio's emphasis on ${languages.join(', ')} technologies positions it favorably within high-growth market segments. Emerging technology integration opportunities include artificial intelligence, cloud-native architectures, and modern development practices. Future technology roadmap alignment ensures continued relevance and competitive positioning as market conditions evolve.`,

    recommendedActions: `Strategic recommendations focus on maximizing portfolio value through targeted investments and strategic initiatives. Priority actions include community development, documentation enhancement, and strategic partnership formation. Technical priorities include performance optimization, security enhancement, and emerging technology integration. Market priorities include positioning refinement, adoption acceleration, and ecosystem expansion. Long-term strategic priorities include sustainability planning, governance evolution, and innovation pipeline development.`,

    portfolioScore: Math.min(10, 6 + (languages.length * 0.5) + (repositories.length * 0.2)),
    marketReadiness: repositories.length > 5 ? 'High - Comprehensive portfolio ready for market expansion' : 'Medium - Solid foundation with growth potential',
    strategicPriorities: [
      'Accelerate community growth and contributor engagement',
      'Enhance enterprise features and commercial readiness',
      'Develop strategic partnerships and ecosystem integrations'
    ]
  };
};

/**
 * Utility functions
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const sanitizeText = (text: string | undefined): string => {
  if (!text) return '';
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getTemperatureForTone = (tone: string): number => {
  switch (tone) {
    case 'technical':
      return 0.3;
    case 'professional':
      return 0.5;
    case 'executive':
      return 0.6;
    case 'casual':
      return 0.8;
    case 'academic':
      return 0.4;
    default:
      return 0.5;
  }
};

/**
 * Batch generate AI content with progress tracking and enhanced data
 */
export const generateBatchAIContent = async (
  repositories: Repository[],
  aiTone: AITone,
  customSections: CustomSection[] = [],
  onProgress?: (completed: number, total: number) => void,
  concurrency = 2 // Reduced for more thorough analysis
): Promise<Record<string, AIContent>> => {
  const results: Record<string, AIContent> = {};
  const queue = [...repositories];
  let activeWorkers = 0;
  let completed = 0;

  const processQueue = async (): Promise<void> => {
    if (queue.length === 0 || activeWorkers >= concurrency) return;

    activeWorkers++;
    const repo = queue.shift()!;

    try {
      // Enhanced analysis with comprehensive data
      results[repo.id.toString()] = await generateAIContent(
        repo,
        aiTone,
        customSections
      );
    } catch (error) {
      console.error(`Failed to generate content for ${repo.name}:`, error);
      results[repo.id.toString()] = generateAdvancedMockAIContent(
        repo,
        aiTone,
        customSections
      );
    } finally {
      completed++;
      activeWorkers--;
      onProgress?.(completed, repositories.length);
      await processQueue();
    }
  };

  // Start initial workers
  const workers = Array(Math.min(concurrency, repositories.length))
    .fill(null)
    .map(processQueue);

  await Promise.all(workers);
  return results;
};