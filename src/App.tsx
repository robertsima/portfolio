import './App.css'
import { useTheme } from './useTheme'
import { initScrollReveal } from './scrollReveal'
import React from 'react';

// Initialize scroll reveal after component mounts
const App = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Set up scroll reveal after initial render
  React.useEffect(() => {
    // Delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initScrollReveal();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const projects = [                                                                                                                                               
    {                                                                                                                                                               
      title: 'E-Commerce Platform',                                                                                                                                 
      type: 'Product build',                                                                                                                                         
      description:                                                                                                                                                    
        'Modern online shopping experience with real-time inventory, fast checkout, and personalized recommendations.',                                            
      metric: '42% faster conversions',                                                                                                                              
      tags: ['React', 'TypeScript', 'Redux', 'Node.js'],                                                                                                            
      href: '#',                                                                                                                                                     
      accent: 'cyan',                                                                                                                                               
    },                                                                                                                                                              
    {                                                                                                                                                               
      title: 'Task Management Dashboard',                                                                                                                            
      type: 'Automation',                                                                                                                                           
      description:                                                                                                                                                    
        'Productivity tool that streamlines team workflows with drag-and-drop interface, automated alerts, and analytics.',                                       
      metric: '18 hrs/week saved',                                                                                                                                   
      tags: ['React', 'Firebase', 'Testing'],                                                                                                                      
      href: '#',                                                                                                                                                     
      accent: 'violet',                                                                                                                                             
    },                                                                                                                                                              
    {                                                                                                                                                               
      title: 'Analytics Reporting Site',                                                                                                                            
      type: 'Marketing site',                                                                                                                                       
      description:                                                                                                                                                    
        'Data visualization platform with interactive charts, customizable dashboards, and real-time metrics.',                                                   
      metric: '96 Lighthouse score',                                                                                                                                 
      tags: ['React', 'D3.js', 'Performance'],                                                                                                                     
      href: '#',                                                                                                                                                     
      accent: 'amber',                                                                                                                                              
    },                                                                                                                                                              
  ]                                                                                                                                                                

  const stats = [                                                                                                                                                  
    { value: '5+', label: 'years building web products' },                                                                                                          
    { value: '30+', label: 'shipped screens and workflows' },                                                                                                       
    { value: '<1s', label: 'target interaction latency' },                                                                                                         
  ]                                                                                                                                                                

  const skills = [                                                                                                                                                 
    'React',                                                                                                                                                       
    'TypeScript',                                                                                                                                                  
    'Design systems',                                                                                                                                              
    'Node.js',                                                                                                                                                     
    'REST APIs',                                                                                                                                                   
    'Accessibility',                                                                                                                                               
    'Testing',                                                                                                                                                     
    'Performance',                                                                                                                                                 
    'Automation',                                                                                                                                                 
    'Git',                                                                                                                                                         
  ]                                                                                                                                                                

  const services = [                                                                                                                                               
    'Slick portfolio and landing pages',                                                                                                                            
    'Dashboards that feel fast',                                                                                                                                   
    'Workflow automation and API glue',                                                                                                                            
    'Frontend cleanup and component systems',                                                                                                                      
  ]                                                                                                                                                                

  const timeline = [                                                                                                                                              
    {                                                                                                                                                               
      date: 'Now',                                                                                                                                                   
      title: 'Building sharp frontend experiences',                                                                                                                 
      detail: 'Focused on modern React, usable interfaces, and production-ready UI systems.',                                                                       
    },                                                                                                                                                              
    {                                                                                                                                                               
      date: 'Before',                                                                                                                                               
      title: 'Shipped tools for real users',                                                                                                                        
      detail: 'Turned vague workflow problems into clear screens, automations, and measurable wins.',                                                              
    },                                                                                                                                                              
    {                                                                                                                                                               
      date: 'Next',                                                                                                                                                  
      title: 'Open for serious work',                                                                                                                               
      detail: 'Available for polished portfolio-worthy builds, product UI, and web app implementation.',                                                         
    },                                                                                                                                                              
  ]                                                                                                                                                                

  return (                                                                                                                                                        
    <main className="site-shell">                                                                                                                                
      <div className="noise" aria-hidden="true" />                                                                                                              
      <div className="orb orb-one" aria-hidden="true" />                                                                                                        
      <div className="orb orb-two" aria-hidden="true" />                                                                                                        

      <header className="site-header">                                                                                                                            
        <a className="brand" href="#top" aria-label="Portfolio home">                                                                                        
          <span className="brand-mark">YN</span>                                                                                                                 
          Your Name                                                                                                                                                 
        </a>                                                                                                                                                        
        <nav className="nav-links" aria-label="Main navigation">                                                                                               
          <a href="#projects">Work</a>                                                                                                                              
          <a href="#services">Services</a>                                                                                                                           
          <a href="#skills">Stack</a>                                                                                                                                
          <a href="#contact">Contact</a>                                                                                                                             
        </nav>                                                                                                                                                      
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-pressed={theme === 'dark'}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>                                                                                                                                                      
      </header>                                                                                                                                                     

      <section id="top" className="hero">                                                                                                                        
        <div className="hero-copy-wrap scroll-reveal">                                                                                                                          
          <p className="status-pill">                                                                                                                                
            <span /> Available for modern web builds                                                                                                                
          </p>                                                                                                                                                        
          <p className="eyebrow">Frontend developer / product builder</p>                                                                                             
          <h1 className="scroll-reveal">                                                                                                                                                     
            I build digital interfaces that look expensive and feel effortless.                                                                               
          </h1>                                                                                                                                                      
          <p className="hero-copy scroll-reveal">                                                                                                                                 
            I create modern, responsive web applications with clean UIs and exceptional user experiences.                                                      
            My focus is on React ecosystem, performance optimization, and building scalable products.                                                            
          </p>                                                                                                                                                        
          <div className="cta-row scroll-reveal">                                                                                                                                 
            <a className="button primary" href="#projects">                                                                                                    
              See selected work                                                                                                                                       
            </a>                                                                                                                                                        
            <a className="button secondary" href="mailto:you@example.com">                                                                                      
              Start a conversation                                                                                                                                    
            </a>                                                                                                                                                        
          </div>                                                                                                                                                      
        </div>                                                                                                                                                      

        <aside className="hero-panel scroll-reveal" aria-label="Portfolio summary">                                                                                           
          <div className="terminal-card">                                                                                                                            
            <div className="terminal-dots" aria-hidden="true">                                                                                                    
              <span />                                                                                                                                                  
              <span />                                                                                                                                                  
              <span />                                                                                                                                                  
            </div>                                                                                                                                                      
            <code>                                                                                                                                                      
              <span className="muted">const</span> developer = {'{'},                                                                                                 
              <br />                                                                                                                                                      
              &nbsp;&nbsp;focus: <span>'React + polished UX'</span>,                                                                                                     
              <br />                                                                                                                                                      
              &nbsp;&nbsp;style: <span>'clean, fast, modern'</span>,                                                                                                      
              <br />                                                                                                                                                      
              &nbsp;&nbsp;status: <span>'available'</span>                                                                                                                
              <br />                                                                                                                                                      
              {'}'},                                                                                                                                                    
            </code>                                                                                                                                                    
          </div>                                                                                                                                                      
          <div className="stat-grid">                                                                                                                                
            {stats.map((stat) => (                                                                                                                                    
              <div className="stat-card scroll-reveal" key={stat.label}>                                                                                                              
                <strong>{stat.value}</strong>                                                                                                                            
                <span>{stat.label}</span>                                                                                                                                 
              </div>                                                                                                                                                      
            ))}                                                                                                                                                         
          </div>                                                                                                                                                      
        </aside>                                                                                                                                                    
      </section>                                                                                                                                                    

      <section className="marquee" aria-label="Core strengths">                                                                                                 
        <div>                                                                                                                                                       
          <span>Clean UI</span>                                                                                                                                     
          <span>Fast React</span>                                                                                                                                   
          <span>Accessible flows</span>                                                                                                                 
          <span>Automation</span>                                                                                                                                   
          <span>Design systems</span>                                                                                                                               
          <span>Production mindset</span>                                                                                                                          
        </div>                                                                                                                                                      
      </section>                                                                                                                                                    

      <section id="projects" className="content-section" aria-labelledby="projects-title">                                                                    
        <div className="section-heading split-heading scroll-reveal">                                                                                                            
          <div>                                                                                                                                                       
            <p className="eyebrow">Selected work</p>                                                                                                                
            <h2 id="projects-title" className="scroll-reveal">Case-study ready project cards.</h2>                                                                                          
          </div>                                                                                                                                                      
          <p className="scroll-reveal">                                                                                                                                                         
            Swap names and metrics with real wins. Cards already structured for screenshots,                                                                                                                                      
            outcomes, stack, and links.                                                                                                                              
          </p>                                                                                                                                                        
        </div>                                                                                                                                                      

        <div className="project-grid">                                                                                                                            
          {projects.map((project, index) => (                                                                                                                       
            <article className={`project-card ${project.accent} scroll-reveal`} key={project.title}>                                                                              
              <div className="project-topline">                                                                                                                      
                <span>{project.type}</span>                                                                                                                            
                <strong>0{index + 1}</strong>                                                                                                                        
              </div>                                                                                                                                                      
              <div className="project-preview" aria-hidden="true">                                                                                                    
                <div />                                                                                                                                                   
                <div />                                                                                                                                                   
                <div />                                                                                                                                                   
              </div>                                                                                                                                                      
              <div>                                                                                                                                                       
                <h3>{project.title}</h3>                                                                                                                                 
                <p>{project.description}</p>                                                                                                                 
              </div>                                                                                                                                                      
              <div className="project-footer">                                                                                                                         
                <strong>{project.metric}</strong>                                                                                                                        
                <ul className="tag-list" aria-label={`${project.title} technologies`}>                                                                                
                  {project.tags.map((tag) => (                                                                                                                          
                    <li key={tag}>{tag}</li>                                                                                                                               
                  ))}                                                                                                                                                       
                </ul>                                                                                                                                                       
              </div>                                                                                                                                                      
              <a href={project.href} aria-label={`Open ${project.title}`}>                                                                                               
                View project →                                                                                                                                          
              </a>                                                                                                                                                        
            </article>                                                                                                                                                
          ))}                                                                                                                                                         
        </div>                                                                                                                                                      
      </section>                                                                                                                                                    

      <section id="services" className="content-section service-section" aria-labelledby="services-title">                                                 
        <div className="section-heading scroll-reveal">                                                                                                                          
          <p className="eyebrow">What I can build</p>                                                                                                               
          <h2 id="services-title" className="scroll-reveal">Useful, sharp, and deployable.</h2>                                                                                             
        </div>                                                                                                                                                      
        <div className="service-grid">                                                                                                                            
          {services.map((service) => (                                                                                                                               
            <article className="service-card scroll-reveal" key={service}>                                                                                                      
              <span aria-hidden="true">✦</span>                                                                                                                     
              <h3>{service}</h3>                                                                                                                                      
              <p>Short description slot. Add real proof, constraints handled, and result delivered.</p>                                                               
            </article>                                                                                                                                              
          ))}                                                                                                                                                         
        </div>                                                                                                                                                      
      </section>                                                                                                                                                    

      <section id="skills" className="content-section skills-section" aria-labelledby="skills-title">                                                        
        <div className="section-heading split-heading scroll-reveal">                                                                                                            
          <div>                                                                                                                                                       
            <p className="eyebrow">Stack</p>                                                                                                                       
            <h2 id="skills-title" className="scroll-reveal">Tools I reach for.</h2>                                                                                                          
          </div>                                                                                                                                                      
          <p className="scroll-reveal">                                                                                                                                                         
            Keep list honest. Remove fluff. Add strongest tools first, then link proof in projects.                                                              
          </p>                                                                                                                                                        
        </div>                                                                                                                                                      
        <ul className="skill-list">                                                                                                                                
          {skills.map((skill) => (                                                                                                                                 
            <li key={skill} className="scroll-reveal">{skill}</li>                                                                                                                            
          ))}                                                                                                                                                         
        </ul>                                                                                                                                                       
      </section>                                                                                                                                                    

      <section className="timeline-section" aria-labelledby="timeline-title">                                                                                  
        <div className="scroll-reveal">                                                                                                                                                       
          <p className="eyebrow">Story</p>                                                                                                                        
          <h2 id="timeline-title" className="scroll-reveal">Narrative without walls of text.</h2>                                                                                          
        </div>                                                                                                                                                      
        <div className="timeline-list">                                                                                                                           
          {timeline.map((item) => (                                                                                                                                 
            <article className="timeline-item scroll-reveal" key={item.title}>                                                                                                 
              <span>{item.date}</span>                                                                                                                                
              <div>                                                                                                                                                   
                <h3>{item.title}</h3>                                                                                                                                 
                <p>{item.detail}</p>                                                                                                                                   
              </div>                                                                                                                                                  
            </article>                                                                                                                                            
          ))}                                                                                                                                                         
        </div>                                                                                                                                                      
      </section>                                                                                                                                                    

      <section id="contact" className="contact-card" aria-labelledby="contact-title">                                                                         
        <div className="scroll-reveal">                                                                                                                                                       
          <p className="eyebrow">Contact</p>                                                                                                                      
          <h2 id="contact-title" className="scroll-reveal">Let's make something worth showing off.</h2>                                                                                    
          <p className="scroll-reveal">Replace placeholders with real email, GitHub, LinkedIn, resume, and calendar links.</p>                                                               
        </div>                                                                                                                                                      
        <div className="contact-actions scroll-reveal">                                                                                                                        
          <a className="button primary" href="mailto:you@example.com">                                                                                         
            you@example.com                                                                                                                                         
          </a>                                                                                                                                                        
          <a className="button secondary" href="https://github.com/yourusername" target="_blank" rel="noreferrer">                                        
            GitHub                                                                                                                                                  
          </a>                                                                                                                                                        
          <a className="button secondary" href="https://linkedin.com/in/yourusername" target="_blank" rel="noreferrer">                                     
            LinkedIn                                                                                                                                                
          </a>                                                                                                                                                        
        </div>                                                                                                                                                      
      </section>                                                                                                                                                    
    </main>                                                                                                                                                       
  )                                                                                                                                                               
}

export default App