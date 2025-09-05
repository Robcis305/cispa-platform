// Dashboard Home Page
'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the CISPA platform. Manage your assessments and view reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/assessments" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessments</h3>
            <p className="text-gray-600">Create and manage transaction readiness assessments.</p>
          </div>
        </Link>

        <Link href="/dashboard/reports" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports</h3>
            <p className="text-gray-600">View and share board-ready assessment reports.</p>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-600">Configure platform settings and preferences.</p>
          <p className="text-sm text-gray-400 mt-2">Coming soon</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Getting Started</h2>
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Welcome to CISPA</h3>
          <p className="text-blue-800 mb-4">
            The CIS Platform Assessment helps reduce transaction readiness assessment time from 40+ hours to under 2 hours.
          </p>
          <div className="space-y-2 text-blue-800">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              <span>Create comprehensive assessments with dynamic question flows</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              <span>Get intelligent scoring and recommendations</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              <span>Generate board-ready reports for investors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}