import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { calculateEMI, calculateTotalInterest, generateAmortizationSchedule, formatCurrency } from '../lib/utils';
import { CalculatorIcon, ChevronDownIcon, DownloadIcon } from './ui/Icons';

const LoanCalculator: React.FC = () => {
  const { loanProducts } = useAppStore();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [principal, setPrincipal] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [tenure, setTenure] = useState<number>(12);
  const [showSchedule, setShowSchedule] = useState(false);

  const product = loanProducts.find((p) => p.id === selectedProduct);

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const prod = loanProducts.find((p) => p.id === productId);
    if (prod) {
      setInterestRate(prod.interest_rate);
      setPrincipal(Math.max(principal, prod.min_amount));
      setTenure(Math.max(tenure, prod.min_tenure_months));
    }
  };

  const calculations = useMemo(() => {
    const emi = calculateEMI(principal, interestRate, tenure);
    const totalInterest = calculateTotalInterest(principal, emi, tenure);
    const totalAmount = principal + totalInterest;
    const processingFee = product ? (principal * product.processing_fee) / 100 : 0;
    const netDisbursement = principal - processingFee;

    return {
      emi,
      totalInterest,
      totalAmount,
      processingFee,
      netDisbursement,
    };
  }, [principal, interestRate, tenure, product]);

  const schedule = useMemo(() => {
    return generateAmortizationSchedule(principal, interestRate, tenure);
  }, [principal, interestRate, tenure]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <CalculatorIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Loan EMI Calculator</h2>
            <p className="text-emerald-100">
              Calculate your monthly installments and view amortization schedule
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan Parameters</h3>

          <div className="space-y-5">
            {/* Loan Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Product (Optional)
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Custom Calculation</option>
                {loanProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.interest_rate}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Principal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  NGN
                </span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  min={product?.min_amount || 1000}
                  max={product?.max_amount || 10000000}
                  className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <input
                type="range"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                min={product?.min_amount || 10000}
                max={product?.max_amount || 5000000}
                step={10000}
                className="w-full mt-2 accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCurrency(product?.min_amount || 10000)}</span>
                <span>{formatCurrency(product?.max_amount || 5000000)}</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (% per annum)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={1}
                  max={50}
                  step={0.5}
                  disabled={!!selectedProduct}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
              {!selectedProduct && (
                <input
                  type="range"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={1}
                  max={50}
                  step={0.5}
                  className="w-full mt-2 accent-emerald-500"
                />
              )}
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Tenure (Months)
              </label>
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                min={product?.min_tenure_months || 1}
                max={product?.max_tenure_months || 60}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="range"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                min={product?.min_tenure_months || 1}
                max={product?.max_tenure_months || 60}
                className="w-full mt-2 accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{product?.min_tenure_months || 1} month</span>
                <span>{product?.max_tenure_months || 60} months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
              <p className="text-emerald-100 text-sm">Monthly EMI</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(calculations.emi)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Total Interest</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(calculations.totalInterest)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(calculations.totalAmount)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Processing Fee</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(calculations.processingFee)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Breakdown</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Principal Amount</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(principal)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-semibold text-gray-900">{interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Loan Tenure</span>
                <span className="font-semibold text-gray-900">{tenure} months</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Total Interest Payable</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(calculations.totalInterest)}
                </span>
              </div>
              {product && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    Processing Fee ({product.processing_fee}%)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(calculations.processingFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Net Disbursement</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(calculations.netDisbursement)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-emerald-50 -mx-6 px-6 rounded-lg">
                <span className="font-semibold text-gray-900">Total Amount Payable</span>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(calculations.totalAmount)}
                </span>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</p>
              <div className="h-4 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500"
                  style={{
                    width: `${(principal / calculations.totalAmount) * 100}%`,
                  }}
                />
                <div
                  className="bg-orange-500"
                  style={{
                    width: `${(calculations.totalInterest / calculations.totalAmount) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-gray-600">
                    Principal ({((principal / calculations.totalAmount) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span className="text-gray-600">
                    Interest (
                    {((calculations.totalInterest / calculations.totalAmount) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Amortization Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="px-6 py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <h3 className="text-lg font-semibold text-gray-900">Amortization Schedule</h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <DownloadIcon size={16} />
                  Export
                </button>
                <ChevronDownIcon
                  size={20}
                  className={`text-gray-400 transition-transform ${
                    showSchedule ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {showSchedule && (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        EMI
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Principal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Interest
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {schedule.map((row) => (
                      <tr key={row.installment} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{row.installment}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(row.dueDate).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(row.emiAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-emerald-600">
                          {formatCurrency(row.principal)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-orange-600">
                          {formatCurrency(row.interest)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
