const { packages, destinations } = require('../data/mockData');

exports.getAllPackages = (req, res) => {
  try {
    const { page = 1, limit = 12, destination, minPrice, maxPrice, duration, sort, search } = req.query;

    let filtered = [...packages];

    // Filter by destination
    if (destination && destination !== 'all') {
      filtered = filtered.filter(p => p.destination.toLowerCase() === destination.toLowerCase());
    }

    // Filter by price range
    if (minPrice) filtered = filtered.filter(p => p.price >= parseInt(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= parseInt(maxPrice));

    // Filter by duration (in days)
    if (duration && duration !== 'all') {
      filtered = filtered.filter(p => p.duration.startsWith(duration));
    }

    // Search by name or destination
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'newest': filtered.sort((a, b) => b.id.localeCompare(a.id)); break;
      default: filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }

    // Pagination
    const total = filtered.length;
    const lim = parseInt(limit);
    const pg = parseInt(page);
    const skip = (pg - 1) * lim;
    const paginated = filtered.slice(skip, skip + lim);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        currentPage: pg,
        totalPages: Math.ceil(total / lim),
        totalItems: total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPackageById = (req, res) => {
  try {
    const pkg = packages.find(p => p.id === req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDestinations = (req, res) => {
  try {
    res.json({ success: true, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFeaturedPackages = (req, res) => {
  try {
    const featured = packages.filter(p => p.featured);
    res.json({ success: true, data: featured });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
