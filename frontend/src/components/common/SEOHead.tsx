import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Veedu Vadagaiku - Chennai Rental Marketplace',
  description = 'Find houses and shops for rent in Chennai. Chennai’s trusted property rental platform.',
  keywords = 'houses for rent chennai, shops for rent chennai, chennai rentals, வீடு வாடகைக்கு',
  image = '/og-image.jpg',
  url,
}) => {
  const fullTitle = title.includes('Veedu Vadagaiku') ? title : `${title} | Veedu Vadagaiku`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
};
