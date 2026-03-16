import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function Courts() {
  const mapRef = useRef(null);
  const hiddenMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hiddenMapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const placesSearchedRef = useRef(false);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [courts, setCourts] = useState([]);
  const [nearbyCourts, setNearbyCourts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [view, setView] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', address: '', surface: 'hard', notes: '' });
  const [addingCourt, setAddingCourt] = useState(false);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [pendingCourtFocus, setPendingCourtFocus] = useState(null);

  // ── Load Google Maps with callback ───────────────────────────────────
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      window.initGoogleMaps = () => setMapsLoaded(true);
      return;
    }
    window.initGoogleMaps = () => setMapsLoaded(true);
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── Get user + location ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, latitude, longitude')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
          if (profile.latitude && profile.longitude) {
            setUserLocation({ lat: profile.latitude, lng: profile.longitude });
          }
        }
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => setUserLocation(prev => prev || { lat: 44.4268, lng: 26.1025 })
        );
      } else {
        setUserLocation(prev => prev || { lat: 44.4268, lng: 26.1025 });
      }
    };
    init();
  }, []);

  // ── Fetch user-added courts from Supabase ────────────────────────────
  useEffect(() => {
    const fetchCourts = async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setCourts(data);
    };
    fetchCourts();
  }, []);

  // ── Search nearby courts via Google Places ───────────────────────────
  const searchNearbyCourts = useCallback((mapInstance) => {
    if (!userLocation || placesSearchedRef.current) return;
    placesSearchedRef.current = true;
    const service = new window.google.maps.places.PlacesService(mapInstance);
    service.nearbySearch(
      { location: userLocation, radius: 10000, keyword: 'tennis court' },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const mapped = results.map(p => ({
            id: `google_${p.place_id}`,
            name: p.name,
            address: p.vicinity,
            lat: p.geometry.location.lat(),
            lng: p.geometry.location.lng(),
            rating: p.rating,
            source: 'google',
            surface: 'unknown',
          }));
          setNearbyCourts(mapped);
        }
        setLoading(false);
      }
    );
  }, [userLocation]);

  // ── Init hidden map (powers Places search for list view) ─────────────
  useEffect(() => {
    if (!mapsLoaded || !userLocation || !hiddenMapRef.current) return;
    if (hiddenMapInstanceRef.current) return;
    const hiddenMap = new window.google.maps.Map(hiddenMapRef.current, {
      center: userLocation,
      zoom: 13,
    });
    hiddenMapInstanceRef.current = hiddenMap;
    searchNearbyCourts(hiddenMap);
  }, [mapsLoaded, userLocation, searchNearbyCourts]);

  // ── Init visible map ─────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'map' || !mapsLoaded || !userLocation || !mapRef.current) return;

    mapInstanceRef.current = null;

    const center = pendingCourtFocus
      ? { lat: pendingCourtFocus.lat, lng: pendingCourtFocus.lng }
      : userLocation;

    // No custom styles — plain map loads tiles most reliably
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: pendingCourtFocus ? 16 : 13,
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    new window.google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#c8ff00',
        fillOpacity: 1,
        strokeColor: '#0a1628',
        strokeWeight: 2,
      },
      title: 'You are here',
    });

    setTimeout(() => {
      map.setCenter(center);
    }, 150);

    setPendingCourtFocus(null);
  }, [view, mapsLoaded, userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add court markers to visible map ────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !mapsLoaded || view !== 'map') return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    const allCourts = [
      ...nearbyCourts,
      ...courts.filter(c => c.latitude && c.longitude).map(c => ({
        ...c, lat: c.latitude, lng: c.longitude, source: 'user',
      })),
    ];
    allCourts.forEach(court => {
      const marker = new window.google.maps.Marker({
        position: { lat: court.lat, lng: court.lng },
        map: mapInstanceRef.current,
        title: court.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: court.source === 'user' ? '#c8ff00' : '#0a1628',
          fillOpacity: 1,
          strokeColor: court.source === 'user' ? '#0a1628' : '#c8ff00',
          strokeWeight: 2,
        },
      });
      marker.addListener('click', () => setSelectedCourt(court));
      markersRef.current.push(marker);
    });
  }, [nearbyCourts, courts, mapsLoaded, view]);

  // ── Add court to Supabase ────────────────────────────────────────────
  const handleAddCourt = async () => {
    if (!addForm.name || !addForm.address) return;
    setAddingCourt(true);
    let lat = null, lng = null;
    if (mapsLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      await new Promise((resolve) => {
        geocoder.geocode({ address: addForm.address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            lat = results[0].geometry.location.lat();
            lng = results[0].geometry.location.lng();
          }
          resolve();
        });
      });
    }
    const { data, error } = await supabase
      .from('courts')
      .insert({
        name: addForm.name,
        address: addForm.address,
        surface: addForm.surface,
        notes: addForm.notes,
        latitude: lat,
        longitude: lng,
        added_by: currentUser?.id,
      })
      .select()
      .single();
    if (!error && data) {
      setCourts(prev => [data, ...prev]);
      setAddForm({ name: '', address: '', surface: 'hard', notes: '' });
      setShowAddForm(false);
    }
    setAddingCourt(false);
  };

  // ── Directions with user location as origin ──────────────────────────
  const getDirections = (court) => {
    const dest = court.lat && court.lng
      ? `${court.lat},${court.lng}`
      : encodeURIComponent(court.address);
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const originParam = origin ? `&origin=${origin}` : '';
    window.open(`https://www.google.com/maps/dir/?api=1${originParam}&destination=${dest}`, '_blank');
  };

  // ── View on Map ──────────────────────────────────────────────────────
  const handleViewOnMap = (court) => {
    setPendingCourtFocus(court);
    setSelectedCourt(court);
    setView('map');
  };

  const allCourts = [
    ...nearbyCourts,
    ...courts.filter(c => c.latitude && c.longitude).map(c => ({
      ...c, lat: c.latitude, lng: c.longitude, source: 'user',
    })),
  ];

  const filtered = allCourts.filter(c =>
    search === '' ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  const surfaceLabels = { hard: 'Hard', clay: 'Clay', grass: 'Grass', indoor: 'Indoor', unknown: 'Unknown' };
  const surfaceColors = { hard: '#3b82f6', clay: '#ef4444', grass: '#22c55e', indoor: '#8b5cf6', unknown: '#9aa0ac' };
  const isVenue = userRole === 'venue';

  return (
    <div style={styles.container}>

      {/* Hidden map div */}
      <div ref={hiddenMapRef} style={{ width: '1px', height: '1px', position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Court Finder</h1>
          <p style={styles.pageSubtitle}>Find tennis courts near you</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowAddForm(true)}>+ Add Court</button>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0ac" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search courts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <span style={styles.clearSearch} onClick={() => setSearch('')}>✕</span>}
      </div>

      {/* View Toggle */}
      <div style={styles.toggleRow}>
        <button
          style={{ ...styles.toggleBtn, ...(view === 'list' ? styles.toggleActive : {}) }}
          onClick={() => setView('list')}
        >📋 List</button>
        <button
          style={{ ...styles.toggleBtn, ...(view === 'map' ? styles.toggleActive : {}) }}
          onClick={() => setView('map')}
        >🗺️ Map</button>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div style={styles.mapWrapper}>
          <div ref={mapRef} style={styles.map} />
          {selectedCourt && (
            <div style={styles.mapPopup}>
              <div style={styles.mapPopupHeader}>
                <div>
                  <p style={styles.mapPopupName}>{selectedCourt.name}</p>
                  <p style={styles.mapPopupAddress}>{selectedCourt.address}</p>
                </div>
                <button style={styles.mapPopupClose} onClick={() => setSelectedCourt(null)}>✕</button>
              </div>
              <div style={styles.mapPopupActions}>
                <button style={styles.directionsBtn} onClick={() => getDirections(selectedCourt)}>
                  🧭 Get Directions
                </button>
              </div>
            </div>
          )}
          <div style={styles.mapLegend}>
            <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#0a1628', border: '2px solid #c8ff00' }} /> Google</span>
            <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#c8ff00', border: '2px solid #0a1628' }} /> Community</span>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner} />
              <p style={styles.loadingText}>Finding courts near you...</p>
            </div>
          ) : (
            <>
              <p style={styles.resultsCount}>{filtered.length} court{filtered.length !== 1 ? 's' : ''} found</p>
              <div style={styles.courtList}>
                {filtered.length === 0 ? (
                  <div style={styles.noResults}>
                    <span style={{ fontSize: '40px' }}>🎾</span>
                    <p style={styles.noResultsText}>No courts found near you.</p>
                    <p style={styles.noResultsSubtext}>Be the first to add one!</p>
                  </div>
                ) : (
                  filtered.map(court => (
                    <div key={court.id} style={styles.courtCard}>
                      <div style={styles.courtCardLeft}>
                        <div style={styles.courtIcon}>🎾</div>
                        <div style={styles.courtInfo}>
                          <div style={styles.courtNameRow}>
                            <p style={styles.courtName}>{court.name}</p>
                            {court.surface && court.surface !== 'unknown' && (
                              <span style={{
                                ...styles.surfaceBadge,
                                backgroundColor: (surfaceColors[court.surface] || '#9aa0ac') + '18',
                                color: surfaceColors[court.surface] || '#9aa0ac',
                              }}>
                                {surfaceLabels[court.surface] || court.surface}
                              </span>
                            )}
                            {court.source === 'user' && (
                              <span style={styles.userAddedBadge}>Community</span>
                            )}
                          </div>
                          <p style={styles.courtAddress}>📍 {court.address}</p>
                          {court.rating && <p style={styles.courtRating}>⭐ {court.rating} on Google</p>}
                          {court.notes && <p style={styles.courtNotes}>{court.notes}</p>}
                        </div>
                      </div>
                      <div style={styles.courtActions}>
                        <button style={styles.directionsBtn} onClick={() => getDirections(court)}>
                          🧭 Directions
                        </button>
                        <button style={styles.mapViewBtn} onClick={() => handleViewOnMap(court)}>
                          🗺️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Add Court Modal */}
      {showAddForm && (
        <div style={styles.modalOverlay} onClick={() => setShowAddForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add a Court</h2>
              <button style={styles.modalClose} onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            {!isVenue ? (
              <div style={styles.venueOnlyBox}>
                <span style={styles.venueOnlyIcon}>🏟️</span>
                <p style={styles.venueOnlyTitle}>Venues Only</p>
                <p style={styles.venueOnlyText}>
                  Only users registered as <strong>Venues</strong> can add courts to the platform.
                  This keeps our court listings accurate and verified.
                </p>
                <p style={styles.venueOnlyText}>
                  If you manage a court or club, create a Venue account to list your facility here.
                </p>
                <button style={styles.venueOnlyBtn} onClick={() => setShowAddForm(false)}>Got it</button>
              </div>
            ) : (
              <>
                <p style={styles.modalSubtitle}>Add your court so players can find and book it!</p>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Court Name *</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Tenis Club Arcul de Triumf"
                    value={addForm.name}
                    onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address *</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Str. Kiseleff 2, București"
                    value={addForm.address}
                    onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Surface Type</label>
                  <div style={styles.surfaceRow}>
                    {['hard', 'clay', 'grass', 'indoor'].map(s => (
                      <button
                        key={s}
                        style={{
                          ...styles.surfaceBtn,
                          backgroundColor: addForm.surface === s ? '#0a1628' : 'white',
                          color: addForm.surface === s ? '#c8ff00' : '#9aa0ac',
                          border: addForm.surface === s ? '1.5px solid #0a1628' : '1.5px solid #e0e4ea',
                        }}
                        onClick={() => setAddForm(p => ({ ...p, surface: s }))}
                      >
                        {surfaceLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Notes (optional)</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. 4 courts, floodlit, public access"
                    value={addForm.notes}
                    onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
                <button
                  style={{
                    ...styles.submitBtn,
                    opacity: (!addForm.name || !addForm.address || addingCourt) ? 0.5 : 1,
                  }}
                  onClick={handleAddCourt}
                  disabled={!addForm.name || !addForm.address || addingCourt}
                >
                  {addingCourt ? 'Adding...' : 'Add Court 🎾'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '300',
    color: '#0a1628',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#9aa0ac',
    margin: '0',
    fontWeight: '400',
  },
  addBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(10,22,40,0.18)',
    whiteSpace: 'nowrap',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    padding: '11px 14px',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
    marginBottom: '14px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#0a1628',
    flex: 1,
    backgroundColor: 'transparent',
    fontWeight: '400',
  },
  clearSearch: {
    fontSize: '13px',
    color: '#9aa0ac',
    cursor: 'pointer',
  },
  toggleRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  toggleBtn: {
    padding: '7px 20px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1.5px solid #e0e4ea',
    backgroundColor: 'white',
    color: '#9aa0ac',
    transition: 'all 0.15s ease',
  },
  toggleActive: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    border: '1.5px solid #0a1628',
  },
  mapWrapper: {
    position: 'relative',
    borderRadius: '16px',
    // overflow hidden removed — it prevents map tiles from loading
    boxShadow: '0 4px 20px rgba(10,22,40,0.1)',
    marginBottom: '16px',
  },
  map: {
    width: '100%',
    height: '420px',
    borderRadius: '16px',
  },
  mapPopup: {
    position: 'absolute',
    bottom: '48px',
    left: '12px',
    right: '12px',
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '14px 16px',
    boxShadow: '0 4px 20px rgba(10,22,40,0.18)',
  },
  mapPopupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  mapPopupName: {
    margin: '0 0 3px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a1628',
  },
  mapPopupAddress: {
    margin: '0',
    fontSize: '12px',
    color: '#9aa0ac',
  },
  mapPopupClose: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#9aa0ac',
    cursor: 'pointer',
    padding: '0',
  },
  mapPopupActions: {
    display: 'flex',
    gap: '8px',
  },
  mapLegend: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.1)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    color: '#5a6270',
    fontWeight: '500',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '16px',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e0e4ea',
    borderTop: '3px solid #0a1628',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '13px',
    color: '#9aa0ac',
  },
  resultsCount: {
    fontSize: '11px',
    color: '#9aa0ac',
    margin: '0 0 12px 0',
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  courtList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  courtCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(10,22,40,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  courtCardLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1,
  },
  courtIcon: {
    fontSize: '24px',
    flexShrink: 0,
    marginTop: '2px',
  },
  courtInfo: { flex: 1 },
  courtNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '3px',
  },
  courtName: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a1628',
  },
  surfaceBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '500',
  },
  userAddedBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '500',
    backgroundColor: 'rgba(200,255,0,0.15)',
    color: '#5a7a00',
  },
  courtAddress: {
    margin: '0 0 3px 0',
    fontSize: '12px',
    color: '#9aa0ac',
  },
  courtRating: {
    margin: '0 0 3px 0',
    fontSize: '11px',
    color: '#9aa0ac',
  },
  courtNotes: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#5a6270',
    fontStyle: 'italic',
  },
  courtActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flexShrink: 0,
  },
  directionsBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '7px 12px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  mapViewBtn: {
    backgroundColor: '#f4f6f8',
    color: '#0a1628',
    padding: '7px 10px',
    borderRadius: '999px',
    border: '1.5px solid #e0e4ea',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '10px',
    textAlign: 'center',
  },
  noResultsText: { fontSize: '14px', color: '#9aa0ac', margin: '0' },
  noResultsSubtext: { fontSize: '12px', color: '#c8ff00', margin: '0', fontWeight: '500' },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(10,22,40,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px 20px 0 0',
    padding: '24px 20px 36px 20px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  modalTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0a1628',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#9aa0ac',
    cursor: 'pointer',
  },
  modalSubtitle: {
    fontSize: '13px',
    color: '#9aa0ac',
    margin: '0 0 20px 0',
  },
  venueOnlyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px 10px 10px 10px',
    gap: '10px',
  },
  venueOnlyIcon: { fontSize: '48px' },
  venueOnlyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0a1628',
    margin: '0',
  },
  venueOnlyText: {
    fontSize: '13px',
    color: '#5a6270',
    margin: '0',
    lineHeight: '1.6',
  },
  venueOnlyBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '11px 32px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  formGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0a1628',
    marginBottom: '7px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e0e4ea',
    fontSize: '13px',
    color: '#0a1628',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  surfaceRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  surfaceBtn: {
    padding: '7px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '13px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default Courts;
