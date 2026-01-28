import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { Search } from 'lucide-react';

const StyleGuidePage = () => {
  const { t } = useLanguage();

  return (
    <MainLayout title="Style Guide">
      <div className="space-y-8">
        {/* Typography */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Page Title (H1)</h1>
              <p className="text-sm text-gray-500">text-2xl sm:text-3xl font-bold text-gray-900</p>
            </div>
            <div>
              <p className="text-base sm:text-sm text-gray-900">Regular Text</p>
              <p className="text-sm text-gray-500">text-base sm:text-sm text-gray-900</p>
            </div>
            <div>
              <p className="text-sm sm:text-xs text-gray-700">Secondary Text</p>
              <p className="text-sm text-gray-500">text-sm sm:text-xs text-gray-700</p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Spacing</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-100 rounded">
              <p className="text-sm">Container Padding</p>
              <code className="text-sm">px-4 sm:px-6 lg:px-8</code>
            </div>
            <div className="space-x-4 flex">
              <div className="p-4 bg-blue-100 rounded">
                <p className="text-sm">Button Spacing</p>
                <code className="text-sm">space-x-4</code>
              </div>
              <div className="p-4 bg-blue-100 rounded">
                <p className="text-sm">Element</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="space-y-4">
            <div className="space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                Secondary Button
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                <Search className="w-4 h-4 mr-2" />
                Button with Icon
              </button>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border">
              <h3 className="font-medium mb-2">Basic Card</h3>
              <p className="text-sm text-gray-600">bg-white rounded-lg shadow p-6</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border">
              <h3 className="font-medium mb-2">Elevated Card</h3>
              <p className="text-sm text-gray-600">bg-white rounded-lg shadow-lg p-6</p>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Form Elements</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Label
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Placeholder text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Input
              </label>
              <select className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </section>

        {/* Tables */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tables</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Header
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Header
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Content
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Content
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default StyleGuidePage;