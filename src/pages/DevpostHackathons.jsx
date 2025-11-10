import React, { useState, useEffect } from 'react';
import { Card, Button, Pill } from '../shared/ui';
import Navigation from '../shared/components/Navigation';

const DevpostHackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = '/api/devpost/hackathons';
      
      console.log(`Fetching data from ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to fetch hackathons');
      }
      
      // Clean the hackathon data to handle HTML tags in prizes
      const cleanedHackathons = (data.hackathons || []).map(hackathon => {
        // Clean prizes data (remove HTML tags)
        let cleanPrizes = hackathon.prizes;
        if (typeof cleanPrizes === 'string') {
          cleanPrizes = cleanPrizes.replace(/<[^>]*>/g, '');
        }
        
        return {
          ...hackathon,
          prizes: cleanPrizes
        };
      });
      
      setHackathons(cleanedHackathons);
      console.log(`Loaded ${cleanedHackathons.length} hackathons`);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError(`${err.message || 'Failed to load hackathons from Devpost'}. Make sure Python and required packages are installed.`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHackathons();
  }, []);
  
  const truncateDescription = (desc, maxLength = 150) => {
    if (!desc || desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength) + '...';
  };
  
  const truncatePrizes = (prizes, maxLength = 25) => {
    if (!prizes || prizes.length <= maxLength) return prizes;
    return `${prizes.substring(0, maxLength)}...`;
  };
  
  const getStatusVariant = (status) => {
    if (!status) return "default";
    status = status.toLowerCase();
    
    if (status === "open" || status === "active") return "success";
    if (status === "upcoming") return "warning";
    if (status === "closed") return "danger";
    return "default";
  };
  
  const getTimeLeftVariant = (timeLeft) => {
    if (!timeLeft) return "default";
    
    if (timeLeft.includes("day")) {
      const days = parseInt(timeLeft);
      if (days <= 3) return "danger";
      if (days <= 7) return "warning";
      return "success";
    }
    
    if (timeLeft.includes("hour") || timeLeft.includes("minute")) {
      return "danger";
    }
    
    return "default";
  };
  
  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <div className="container mx-auto pt-24 px-4 py-8 mt-4">
        <Card className="mb-6">
          <Card.Header>
            <Card.Title className="text-2xl text-center">Devpost Hackathons</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-center text-[#A9B1D6]">
              Explore hackathons from Devpost
            </p>
          </Card.Content>
        </Card>
        
        {/* Error display */}
          {error && (
            <Card className="mb-6 border-red-300">
              <Card.Content>
                <p className="text-red-500">{error}</p>
                <Button 
                  onClick={fetchHackathons} 
                  variant="danger"
                  className="mt-2"
                >
                  Retry
                </Button>
              </Card.Content>
            </Card>
          )}
          
          {/* Loading state */}
          {loading ? (
            <Card className="text-center py-12">
              <Card.Content className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AA2F7]"></div>
                <span className="mt-4 text-[#A9B1D6]">Loading hackathons...</span>
              </Card.Content>
            </Card>
          ) : hackathons.length === 0 ? (
            <Card className="text-center py-12">
              <Card.Content>
                <p className="text-[#A9B1D6]">
                  No hackathons found.
                </p>
              </Card.Content>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hackathons.map((hackathon, index) => (
                <Card key={index} className="flex flex-col h-full min-w-[300px] max-w-[400px]">
                  <Card.Header>
                    <div className="flex justify-between items-start">
                      <Card.Title className="line-clamp-2 text-[#7AA2F7]">
                        {hackathon.title}
                      </Card.Title>
                      <Pill variant={getStatusVariant(hackathon.status)}>
                        {hackathon.status}
                      </Pill>
                    </div>
                  </Card.Header>
                  
                  <Card.Content className="flex-1">
                    {hackathon.image && (
                      <div className="w-full h-40 mb-4 flex items-center justify-center bg-surface overflow-hidden rounded-lg">
                        <img 
                          src={hackathon.image} 
                          alt={hackathon.title} 
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                    )}
                    
                    {hackathon.description && (
                      <p className="text-[#A9B1D6] text-sm mb-4 line-clamp-2">
                        {truncateDescription(hackathon.description)}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm text-[#A9B1D6] mb-4">
                      {hackathon.submission_period && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Period:</span>
                          <span>{hackathon.submission_period}</span>
                        </div>
                      )}
                      
                      {hackathon.participants && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Participants:</span>
                          <span>{hackathon.participants}</span>
                        </div>
                      )}
                      
                      {hackathon.time_left && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Time Left:</span>
                          <Pill variant={getTimeLeftVariant(hackathon.time_left)}>
                            {hackathon.time_left}
                          </Pill>
                        </div>
                      )}
                      
                      {hackathon.location && (
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="font-medium mr-2">Location:</span>
                          <Pill variant="info">
                            {hackathon.location}
                          </Pill>
                        </div>
                      )}
                      
                      {hackathon.prizes && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Prizes:</span>
                          <Pill variant="primary">{truncatePrizes(hackathon.prizes)}</Pill>
                        </div>
                      )}
                    </div>
                  </Card.Content>
                  
                  <Card.Footer>
                    <a 
                      href={hackathon.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button 
                        variant="primary"
                        className="w-full"
                      >
                        View on Devpost
                      </Button>
                    </a>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default DevpostHackathons;
