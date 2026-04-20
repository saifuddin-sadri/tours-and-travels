let inquiries = [];
let counter = 1;

exports.submitInquiry = (req, res) => {
  try {
    const { name, email, phone, preferredDestination, travelDate, message, source } = req.body;

    // Validation
    if (!name || !email || !phone || !preferredDestination || !travelDate) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, error: 'Invalid Indian phone number.' });
    }

    const inquiryId = `INQ-${Date.now()}-${String(counter++).padStart(3, '0')}`;
    const inquiry = {
      id: inquiryId,
      name, email, phone,
      preferredDestination, travelDate,
      message: message || '',
      source: source || 'website',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    inquiries.push(inquiry);

    console.log(`📩 New inquiry received: ${inquiryId} - ${name} (${email}) for ${preferredDestination}`);

    res.json({
      success: true,
      message: 'Inquiry submitted successfully! Our team will contact you within 24 hours.',
      inquiryId,
      data: {
        id: inquiryId,
        name, email, phone,
        status: 'new',
        createdAt: inquiry.createdAt,
        nextStep: 'Our team will contact you within 24 hours.',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getWhatsAppUrl = (req, res) => {
  try {
    const { packageName, name } = req.body;
    const phone = process.env.BUSINESS_WHATSAPP_NUMBER || '+919876543210';
    const clean = phone.replace(/\D/g, '');
    const msg = `Hi! I'm ${name || 'interested'} and want to know more about the *${packageName || 'travel package'}*. Please share details.`;
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
    res.json({ success: true, whatsappUrl: url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
