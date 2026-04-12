'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Users,
  CheckCircle2,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We constantly evolve our tech stack and service offerings to ensure our clients stay ahead of the digital curve.',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: ShieldCheck,
    title: 'Unwavering Trust',
    description: 'Security and transparency are at the core of every transaction. Your data and privacy are our top priorities.',
    color: 'bg-emerald-500/10 text-emerald-600'
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'We understand the value of time. Our systems are optimized to deliver results the moment you need them.',
    color: 'bg-amber-500/10 text-amber-600'
  },
  {
    icon: Heart,
    title: 'Customer-Centric',
    description: 'MilkyTech.Online is built by real people for real people. Our support team is always just a message away.',
    color: 'bg-rose-500/10 text-rose-600'
  }
]

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-slate-50 border-b border-slate-100">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center space-y-6">
            <motion.div initial="hidden" animate="visible" variants={reveal} custom={0}>
              <Badge variant="outline" className="px-3 py-1 text-sm bg-white border-primary/20 text-primary shadow-sm rounded-full">
                <Globe className="h-3.5 w-3.5 mr-1.5" />
                The Story Behind MilkyTech.Online
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial="hidden" animate="visible" variants={reveal} custom={1}
              className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto"
            >
              Empowering the Digital Future, <br />
              <span className="text-primary italic">One Solution at a Time.</span>
            </motion.h1>
            
            <motion.p 
              initial="hidden" animate="visible" variants={reveal} custom={2}
              className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              Founded on the pillars of speed, reliability, and innovation, MilkyTech.Online is dedicated to bridging the gap between complex digital needs and seamless professional solutions.
            </motion.p>
          </div>
        </div>
      </section>

      {/* 2. FOUNDER SECTION */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Image - The 3D Owner */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} custom={0}
              className="relative aspect-square max-w-md mx-auto lg:mx-0"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-3 scale-105 blur-2xl" />
              <Card className="relative h-full w-full rounded-3xl overflow-hidden border-none glow-green">
                <Image 
                  src="/images/owner.png" 
                  alt="MilkyTech.Online Founder" 
                  fill 
                  className="object-cover"
                />
              </Card>
              <div className="absolute -bottom-6 -right-6 p-6 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 max-w-[200px] hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner & Visionary</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Driving digital excellence for 500+ clients worldwide.</p>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div variants={reveal} custom={1}>
                  <Badge variant="secondary" className="bg-primary/5 text-primary rounded-full">Meet the Founder</Badge>
                </motion.div>
                <motion.h2 variants={reveal} custom={2} className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  Driven by a Passion for <span className="text-primary italic">Digital Transformation</span>
                </h2 >
                <motion.p variants={reveal} custom={3} className="text-lg text-slate-600 leading-relaxed">
                  "Hello! I am the founder of MilkyTech.Online. My journey started with a simple belief: high-end tech services shouldn't be complicated or inaccessible. I wanted to build a platform where quality meets speed — where every client feels like their project is our most important one."
                </motion.p>
                <motion.p variants={reveal} custom={4} className="text-lg text-slate-600 leading-relaxed">
                  MilkyTech.Online was born out of a desire to provide ethical, high-quality, and instant digital solutions. Whether it's a simple subscription or a complex web application, our goal is to help you thrive in the modern world with confidence.
                </motion.p>
              </div>

              <motion.div variants={reveal} custom={5} className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">5+ Years</p>
                    <p className="text-xs text-slate-500">Industry Excellence</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Global</p>
                    <p className="text-xs text-slate-500">Client Network</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. CORE VALUES GRID */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Our Core Pillars</h2>
            <p className="text-slate-600 max-w-2xl mx-auto italic">How we ensure every project becomes a success story.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div 
                key={v.title} 
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={reveal} custom={i}
              >
                <Card className="h-full border-none shadow-sm shadow-slate-200/50 hover:shadow-xl transition-all group hover:-translate-y-1">
                  <CardContent className="p-8 space-y-5">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${v.color} group-hover:scale-110 transition-transform`}>
                      <v.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{v.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {v.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MISSION STATEMENT */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-10"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
              Our Mission is to <span className="text-primary italic underline underline-offset-8 decoration-primary/30">Democratize Digital Innovation</span> for Everyone.
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              We aren't just selling services; we are building partnerships. We believe that by providing reliable tech solutions, we enable our clients to focus on their unique talents and reach their full potential.
            </p>
            <div className="pt-4 flex justify-center gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-${i === 1 ? '12' : '3'} rounded-full bg-primary/${i === 1 ? '100' : '20'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white !m-4 !md:m-12 rounded-[2.5rem] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary/20 opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full grid-pattern opacity-10" />
        <div className="relative z-10 container mx-auto px-4 max-w-3xl">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={reveal} custom={0}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to start your journey?</h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">
              Join the hundreds of businesses that have scaled with MilkyTech.Online. Access premium services and instant results today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-10 text-base bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-2xl shadow-primary/20">
                <Link href="/auth/signup">
                  Join the Community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-10 text-base bg-transparent border-white/20 text-white hover:bg-white/10 rounded-2xl backdrop-blur-sm">
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
