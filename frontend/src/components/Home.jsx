/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { CheckCircle, Clock, Shield, ChevronRight, BookOpen, Users, BarChart } from "lucide-react";
const role = localStorage.getItem('role');

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const getStartedLink = role
    ? role === "student"
      ? "/student-dashboard"
      : role === "examiner"
      ? "/examiner-dashboard"
      : "/dashboard" // fallback
    : "/signup";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-6">
              <span className="flex items-center text-sm font-medium">
                <BookOpen size={16} className="mr-2" />
                Examify Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl font-bold mb-6 text-gray-900"
            >
              Revolutionize Your <span className="text-blue-500">Online Examination</span> Experience
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
            >
              Create, manage, and analyze exams with unparalleled security and real-time insights. The all-in-one platform trusted by leading educational institutions worldwide.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href={getStartedLink}
                className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ChevronRight size={18} className="ml-1" />
              </motion.a>
              <motion.a
                href="/demo"
                className="border-2 border-blue-300 text-blue-500 font-semibold py-3 px-8 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                View Demo
              </motion.a>
            </motion.div>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
              <div className="aspect-[16/9] bg-blue-100 rounded-xl flex items-center justify-center">
                <img
                  src="../preview.png"
                  alt="Dashboard Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

      
            <div className="absolute -top-6 -right-6 bg-blue-100 p-3 rounded-lg shadow-md border border-blue-200">
              <BarChart size={24} className="text-blue-500" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-blue-100 p-3 rounded-lg shadow-md border border-blue-200">
              <Shield size={24} className="text-blue-500" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">Why Choose Examify</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">Powerful Features for Modern Education</h2>
            <div className="h-1 w-20 bg-blue-500 mx-auto mt-6 mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">Our platform combines cutting-edge technology with intuitive design to create the perfect examination experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Shield size={24} className="text-blue-500" />, title: "Advanced Security", desc: "Prevent cheating with AI-powered proctoring" },
              { icon: <Clock size={24} className="text-blue-500" />, title: "Time-Saving", desc: "Automated grading and instant results" },
              { icon: <BarChart size={24} className="text-blue-500" />, title: "Deep Analytics", desc: "Comprehensive performance insights" },
              { icon: <Users size={24} className="text-blue-500" />, title: "Scalable", desc: "Handle thousands of concurrent test-takers" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.p className="text-2xl font-medium text-gray-700 text-center">Trusted by leading institutions</motion.p>

            {["Harvard", "MIT", "Stanford", "Oxford", "Cambridge"].map((logo, idx) => (
              <motion.div
                key={idx}
                className="text-xl font-bold uppercase tracking-wider text-gray-500"
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, color: "#3b82f6" }}
              >
                {logo}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[
              { number: "99.9%", label: "Uptime" },
              { number: "2M+", label: "Exams Taken" },
              { number: "5K+", label: "Institutions" },
              { number: "150+", label: "Countries" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-xl bg-gray-50 border border-gray-100 shadow-sm"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              >
                <h3 className="text-4xl font-bold text-blue-500 mb-2">{stat.number}</h3>
                <p className="text-gray-700 uppercase tracking-wide text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
      <section className="py-20 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to transform your examination process?</h2>
            <p className="text-xl text-gray-700 mb-8">Join thousands of educators who have already made the switch to Examify.</p>
            <motion.a
              href="/signup"
              className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center justify-center hover:bg-blue-600 transition-all shadow-md text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Today
              <ChevronRight size={20} className="ml-1" />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}