export default function ReturnRefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Return & Refund Policy</h1>
      
      <div className="prose prose-emerald max-w-none text-gray-600 space-y-6">
        <p>
          Thank you for shopping at FreshMart. We want you to be completely satisfied with your purchase. If you are not entirely satisfied, we're here to help.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Returns</h2>
        <p>
          You have <strong>3 calendar days</strong> to return an item from the date you received it. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
        </p>
        <p>
          Items that are perishable (such as fresh fruits, some dairy products) cannot be returned unless they arrived spoiled or damaged.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Refunds</h2>
        <p>
          Once we receive your item, we will inspect it and notify you that we have received your returned item. If your return is approved, we will initiate a refund to your original method of payment (or provide store credit).
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Shipping Costs for Returns</h2>
        <p>
          You will be responsible for paying for your own shipping costs for returning your item unless the return is due to a mistake on our part (e.g., wrong item sent, damaged item). Shipping costs are non-refundable.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
        <p>
          If you have any further questions on how to return your item to us, please contact our support team via the Contact Us page or call us directly.
        </p>
      </div>
    </div>
  );
}
