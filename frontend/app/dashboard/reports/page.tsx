'use client';

import { useEffect, useState } from 'react';
import { reportsAPI } from '@/services/api';
import { FileText, Download } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'volunteer' | 'campaign' | 'repeat'>('stock');
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [volunteerStock, setVolunteerStock] = useState<any[]>([]);
  const [campaignDistribution, setCampaignDistribution] = useState<any[]>([]);
  const [repeatDistribution, setRepeatDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [activeTab]);

  const loadReport = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'stock':
          const stockRes = await reportsAPI.getStockSummary();
          setStockSummary(stockRes.data.data);
          break;
        case 'volunteer':
          const volunteerRes = await reportsAPI.getVolunteerStock();
          setVolunteerStock(volunteerRes.data.data);
          break;
        case 'campaign':
          const campaignRes = await reportsAPI.getCampaignDistribution();
          setCampaignDistribution(campaignRes.data.data);
          break;
        case 'repeat':
          const repeatRes = await reportsAPI.getRepeatDistribution();
          setRepeatDistribution(repeatRes.data.data);
          break;
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const stockColumns = [
    { key: 'item', label: 'Item', render: (val: any) => val.name },
    { key: 'item', label: 'Category', render: (val: any) => val.category },
    { key: 'centralStock', label: 'Central Stock' },
    { key: 'volunteerStock', label: 'With Volunteers' },
    { key: 'totalDistributed', label: 'Distributed' },
    { key: 'totalDamaged', label: 'Damaged' }
  ];

  const campaignColumns = [
    { key: 'item', label: 'Item', render: (val: any) => val?.name || 'N/A' },
    { key: 'totalQuantity', label: 'Total Quantity' },
    { key: 'distributionCount', label: 'Distribution Count' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and distribution reports"
        icon={FileText}
        action={
          <Button icon={Download} variant="secondary">
            Export
          </Button>
        }
      />

      <ContentCard>
        <div className="border-b border-slate-200">
          <div className="flex gap-1 p-2 overflow-x-auto">
            {[
              { key: 'stock', label: 'Stock Summary' },
              { key: 'volunteer', label: 'Volunteer Stock' },
              { key: 'campaign', label: 'Campaign Distribution' },
              { key: 'repeat', label: 'Repeat Distribution' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'stock' && (
            <DataTable
              columns={stockColumns}
              data={stockSummary}
              loading={loading}
              searchPlaceholder="Search items..."
              emptyMessage="No stock data available"
            />
          )}

          {activeTab === 'volunteer' && (
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : volunteerStock.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No volunteer stock data</div>
              ) : (
                volunteerStock.map((v: any, index) => (
                  <ContentCard key={index} className="p-6" delay={index * 0.1}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{v.volunteer.name}</h3>
                        <p className="text-sm text-slate-500">{v.volunteer.email}</p>
                      </div>
                      <Badge variant="info">VOLUNTEER</Badge>
                    </div>
                    <DataTable
                      columns={[
                        { key: 'item', label: 'Item', render: (val: any) => val.name },
                        { key: 'item', label: 'Unit', render: (val: any) => val.unit },
                        { key: 'stock', label: 'Stock' }
                      ]}
                      data={v.items}
                      searchable={false}
                      emptyMessage="No items assigned"
                    />
                  </ContentCard>
                ))
              )}
            </div>
          )}

          {activeTab === 'campaign' && (
            <DataTable
              columns={campaignColumns}
              data={campaignDistribution}
              loading={loading}
              searchPlaceholder="Search items..."
              emptyMessage="No campaign distribution data"
            />
          )}

          {activeTab === 'repeat' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : repeatDistribution.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No repeat distribution data</div>
              ) : (
                repeatDistribution.map((area: any, index) => (
                  <ContentCard key={index} className="p-6" delay={index * 0.05}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          City ID: {area._id.cityId} - Area: {area._id.area}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Total Distributions: {area.count}
                        </p>
                      </div>
                      <Badge variant="warning">{area.count}x</Badge>
                    </div>
                  </ContentCard>
                ))
              )}
            </div>
          )}
        </div>
      </ContentCard>
    </div>
  );
}
