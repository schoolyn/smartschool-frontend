import CustomSelectDropdown from "@/components/custom-select";
import DatePicker from "@/components/date-picker";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmpty } from "@/components/table";
import { SelectOption } from "@/types";
import SectionHeader from "@/components/section-header";
import { exportToCsv } from "@/utils";
import useFeesController from "./fees-controller";

const inputClass =
  "mt-1 block w-full p-2 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm";

const formatMoney = (paise: number) => `${(paise / 100).toFixed(2)}`;

const categoryOptions: SelectOption[] = [
  { id: "tuition", name: "Tuition" },
  { id: "transport", name: "Transport" },
  { id: "hostel", name: "Hostel" },
  { id: "exam", name: "Exam" },
  { id: "misc", name: "Misc" },
];

const methodOptions: SelectOption[] = [
  { id: "cash", name: "Cash" },
  { id: "cheque", name: "Cheque" },
  { id: "bank_transfer", name: "Bank transfer" },
  { id: "upi", name: "UPI" },
  { id: "card", name: "Card" },
];

const tabs: { key: "heads" | "structures" | "students" | "ledger"; label: string }[] = [
  { key: "structures", label: "Fee Structures" },
  { key: "heads", label: "Fee Heads" },
  { key: "students", label: "Student Fees & Payments" },
  { key: "ledger", label: "Payment Ledger" },
];

const Badge = ({ tone, children }: { tone: "green" | "red" | "gray"; children: React.ReactNode }) => {
  const toneClass =
    tone === "green"
      ? "bg-green-100 text-green-800"
      : tone === "red"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${toneClass}`}>{children}</span>;
};

const AdminFees = () => {
  const {
    activeTab,
    setActiveTab,
    feeHeads,
    headForm,
    handleHeadFormChange,
    handleCreateFeeHead,
    isCreatingHead,
    feeStructures,
    classOptions,
    sectionOptions,
    classIds,
    sectionIds,
    toggleClass,
    toggleSection,
    items,
    addItemRow,
    updateItemRow,
    removeItemRow,
    installments,
    addInstallmentRow,
    updateInstallmentRow,
    removeInstallmentRow,
    structureName,
    setStructureName,
    itemsTotal,
    installmentsTotal,
    handleCreateFeeStructure,
    isCreatingStructure,
    handleAssignStructure,
    isAssigning,
    studentSearch,
    setStudentSearch,
    studentSearchResults,
    selectedStudentId,
    setSelectedStudentId,
    studentFeeSummaries,
    paymentForm,
    handlePaymentFormChange,
    handleRecordPayment,
    isRecordingPayment,
    paymentLedger,
    handleReversePayment,
    concessionForm,
    handleConcessionFormChange,
    handleGrantConcession,
    isGrantingConcession,
  } = useFeesController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Fees"
        description="Manage fee heads, structures, student assignments and payment collection"
      />
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "heads" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create Fee Head</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <input
              className={inputClass}
              placeholder="Name"
              value={headForm.name}
              onChange={(e) => handleHeadFormChange("name", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Code (e.g. TUI)"
              value={headForm.code}
              onChange={(e) => handleHeadFormChange("code", e.target.value)}
            />
            <CustomSelectDropdown
              options={categoryOptions}
              value={categoryOptions.find((o) => o.id === headForm.category) || null}
              onChange={(o) => handleHeadFormChange("category", String(o.id))}
            />
            <button
              onClick={handleCreateFeeHead}
              disabled={isCreatingHead}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Code</TableHead>
                <TableHead className="text-center">Category</TableHead>
              </TableHeader>
              <TableBody>
                {feeHeads.length === 0 ? (
                  <TableEmpty colSpan={3} message="No fee heads yet — add one above." />
                ) : (
                  feeHeads.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium text-gray-900">{h.name}</TableCell>
                      <TableCell className="text-center">{h.code}</TableCell>
                      <TableCell className="text-center capitalize">{h.category}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "structures" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create Fee Structure</h2>
            <input
              className={inputClass}
              placeholder="Structure name (e.g. Class 9 Annual Fee)"
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Classes</label>
              <div className="flex flex-wrap gap-2">
                {classOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.id)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      classIds.includes(c.id) ? "bg-primary-100 text-primary-800 border-primary-300" : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sections (optional, narrows classes above)</label>
              <div className="flex flex-wrap gap-2">
                {sectionOptions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    {classIds.length ? "These classes have no sections yet." : "Pick a class above to see its sections."}
                  </p>
                )}
                {sectionOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSection(s.id)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      sectionIds.includes(s.id) ? "bg-primary-100 text-primary-800 border-primary-300" : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Fee head items (amounts in your currency)</label>
                <button type="button" onClick={addItemRow} className="text-xs text-primary-600">
                  + Add item
                </button>
              </div>
              {items.map((item, idx) => {
                const feeHeadOptions: SelectOption[] = feeHeads.map((h) => ({ id: h.id, name: h.name }));
                return (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-2 items-center">
                    <CustomSelectDropdown
                      options={feeHeadOptions}
                      value={feeHeadOptions.find((o) => o.id === item.feeHeadId) || null}
                      placeholder="Fee head"
                      onChange={(o) => updateItemRow(idx, "feeHeadId", String(o.id))}
                    />
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) => updateItemRow(idx, "amount", e.target.value)}
                    />
                    <button type="button" onClick={() => removeItemRow(idx)} className="text-sm text-red-600 justify-self-start">
                      Remove
                    </button>
                  </div>
                );
              })}
              <p className="text-xs text-gray-500">Total: {itemsTotal}</p>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Installments</label>
                <button type="button" onClick={addInstallmentRow} className="text-xs text-primary-600">
                  + Add installment
                </button>
              </div>
              {installments.map((inst, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-center">
                  <input
                    className={inputClass}
                    placeholder="Label"
                    value={inst.label}
                    onChange={(e) => updateInstallmentRow(idx, "label", e.target.value)}
                  />
                  <DatePicker value={inst.dueDate} onChange={(value) => updateInstallmentRow(idx, "dueDate", value)} />
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Amount"
                    value={inst.amount}
                    onChange={(e) => updateInstallmentRow(idx, "amount", e.target.value)}
                  />
                  <button type="button" onClick={() => removeInstallmentRow(idx)} className="text-sm text-red-600 justify-self-start">
                    Remove
                  </button>
                </div>
              ))}
              <p className={`text-xs ${itemsTotal === installmentsTotal ? "text-gray-500" : "text-red-600"}`}>
                Total: {installmentsTotal} {itemsTotal !== installmentsTotal && "(must match items total)"}
              </p>
            </div>

            <button
              onClick={handleCreateFeeStructure}
              disabled={isCreatingStructure}
              className="mt-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              Create structure
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Existing structures</h2>
            <Table>
              <TableHeader>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Classes</TableHead>
                <TableHead className="text-center">Installments</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableHeader>
              <TableBody>
                {feeStructures.length === 0 ? (
                  <TableEmpty colSpan={4} message="No fee structures yet — create one above." />
                ) : (
                  feeStructures.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-gray-900">{s.name}</TableCell>
                      <TableCell className="text-center">{s.classIds.map((c) => c.name).join(", ")}</TableCell>
                      <TableCell className="text-center">{s.installments.length}</TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleAssignStructure(s.id)}
                          disabled={isAssigning}
                          className="text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
                        >
                          Assign to students
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Find a student</h2>
            <input
              className={inputClass}
              placeholder="Search by name or admission number"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {studentSearchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    selectedStudentId === s.id ? "bg-primary-100 text-primary-800 border-primary-300" : "bg-white text-gray-600 border-gray-300"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {studentFeeSummaries.map((summary) => (
            <div key={summary.studentFeeId} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-900">
                  Balance: {formatMoney(summary.totalBalance)} of {formatMoney(summary.totalNet)}
                </h3>
                <Badge tone={summary.totalBalance > 0 ? "red" : "green"}>
                  {summary.totalBalance > 0 ? "Due" : "Fully paid"}
                </Badge>
              </div>

              <div className="mb-4">
                <Table>
                  <TableHeader>
                    <TableHead>Installment</TableHead>
                    <TableHead className="text-center">Due</TableHead>
                    <TableHead className="text-center">Net</TableHead>
                    <TableHead className="text-center">Paid</TableHead>
                    <TableHead className="text-center">Balance</TableHead>
                  </TableHeader>
                  <TableBody>
                    {summary.installments.map((i) => (
                      <TableRow key={i.label}>
                        <TableCell className="font-medium text-gray-900">{i.label}</TableCell>
                        <TableCell className="text-center">{new Date(i.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">{formatMoney(i.netAmount)}</TableCell>
                        <TableCell className="text-center">{formatMoney(i.paidAmount)}</TableCell>
                        <TableCell className={`text-center ${i.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatMoney(i.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Record a payment</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Amount"
                    value={paymentForm.studentFeeId === summary.studentFeeId ? paymentForm.amount : ""}
                    onChange={(e) => {
                      handlePaymentFormChange("studentFeeId", summary.studentFeeId);
                      handlePaymentFormChange("amount", e.target.value);
                    }}
                  />
                  <CustomSelectDropdown
                    options={methodOptions}
                    value={
                      methodOptions.find(
                        (o) => o.id === (paymentForm.studentFeeId === summary.studentFeeId ? paymentForm.method : "cash")
                      ) || methodOptions[0]
                    }
                    onChange={(o) => {
                      handlePaymentFormChange("studentFeeId", summary.studentFeeId);
                      handlePaymentFormChange("method", String(o.id));
                    }}
                  />
                  <input
                    className={inputClass}
                    placeholder="Reference (cheque no. / UTR)"
                    value={paymentForm.studentFeeId === summary.studentFeeId ? paymentForm.instrumentRef : ""}
                    onChange={(e) => {
                      handlePaymentFormChange("studentFeeId", summary.studentFeeId);
                      handlePaymentFormChange("instrumentRef", e.target.value);
                    }}
                  />
                  <button
                    onClick={handleRecordPayment}
                    disabled={isRecordingPayment}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    Record
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Grant a concession</p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Amount"
                    value={concessionForm.studentFeeId === summary.studentFeeId ? concessionForm.amount : ""}
                    onChange={(e) => {
                      handleConcessionFormChange("studentFeeId", summary.studentFeeId);
                      handleConcessionFormChange("amount", e.target.value);
                    }}
                  />
                  <input
                    className={inputClass}
                    placeholder="Reason"
                    value={concessionForm.studentFeeId === summary.studentFeeId ? concessionForm.reason : ""}
                    onChange={(e) => {
                      handleConcessionFormChange("studentFeeId", summary.studentFeeId);
                      handleConcessionFormChange("reason", e.target.value);
                    }}
                  />
                  <CustomSelectDropdown
                    placeholder="Any installment (oldest first)"
                    options={summary.installments.map((i): SelectOption => ({ id: i.label, name: i.label }))}
                    value={
                      concessionForm.studentFeeId === summary.studentFeeId && concessionForm.installmentLabel
                        ? { id: concessionForm.installmentLabel, name: concessionForm.installmentLabel }
                        : null
                    }
                    onChange={(o) => {
                      handleConcessionFormChange("studentFeeId", summary.studentFeeId);
                      handleConcessionFormChange("installmentLabel", String(o.id));
                    }}
                  />
                  <button
                    onClick={handleGrantConcession}
                    disabled={isGrantingConcession}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    Grant
                  </button>
                </div>
              </div>

              {summary.concessions && summary.concessions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Concessions granted</p>
                  <Table>
                    <TableHeader>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                    </TableHeader>
                    <TableBody>
                      {summary.concessions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.reason}</TableCell>
                          <TableCell className="text-center">{formatMoney(c.amount)}</TableCell>
                          <TableCell className="text-center">{new Date(c.approvedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {summary.payments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment history</p>
                  <Table>
                    <TableHeader>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                      <TableHead className="text-center">Method</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableHeader>
                    <TableBody>
                      {summary.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.receiptNumber}</TableCell>
                          <TableCell className="text-center">
                            <Badge tone={p.entryType === "reversal" ? "red" : "green"}>
                              {p.entryType === "reversal" ? "Reversal" : "Payment"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{formatMoney(p.amount)}</TableCell>
                          <TableCell className="text-center capitalize">{p.method.replace("_", " ")}</TableCell>
                          <TableCell className="text-center">
                            {p.entryType === "payment" && (
                              <button onClick={() => handleReversePayment(p.id)} className="text-red-600 hover:text-red-800">
                                Reverse
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Payment Ledger</h2>
            <button
              onClick={() =>
                exportToCsv(
                  "payment-ledger",
                  paymentLedger.map((p) => ({
                    receipt: p.receiptNumber,
                    student: typeof p.studentId === "object" ? p.studentId.name : "",
                    type: p.entryType === "reversal" ? "Reversal" : "Payment",
                    amount: p.amount / 100,
                    method: p.method,
                    date: new Date(p.paidAt).toLocaleDateString(),
                  }))
                )
              }
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Export CSV
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-center">Student</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Amount</TableHead>
              <TableHead className="text-center">Method</TableHead>
              <TableHead className="text-center">Date</TableHead>
            </TableHeader>
            <TableBody>
              {paymentLedger.length === 0 ? (
                <TableEmpty colSpan={6} message="No payments recorded yet." />
              ) : (
                paymentLedger.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.receiptNumber}</TableCell>
                    <TableCell className="text-center font-medium text-gray-900">
                      {typeof p.studentId === "object" ? p.studentId.name : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge tone={p.entryType === "reversal" ? "red" : "green"}>
                        {p.entryType === "reversal" ? "Reversal" : "Payment"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{formatMoney(p.amount)}</TableCell>
                    <TableCell className="text-center capitalize">{p.method.replace("_", " ")}</TableCell>
                    <TableCell className="text-center">{new Date(p.paidAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminFees;
