import React, { useState } from 'react';

const PanchakarmaRepo = () => {
  // Sample data for all five Panchakarma therapies with subdivisions
  const therapiesData = [
    {
      name: "Vamana",
      description: "Emesis therapy that removes excess Kapha dosha from the body through controlled vomiting. This cleansing therapy helps eliminate toxins and restore balance to the respiratory and digestive systems.",
      subdivisions: [
        {
          title: "Preparation (Purva Karma)",
          videoUrl: "https://www.youtube.com/embed/-RTwcKF8rH8",
          transcript: "The preparation phase for Vamana therapy involves several important steps. First, the patient undergoes Snehana (oleation therapy) with medicated oils for 3-7 days to prepare the body. This is followed by Swedana (sudation therapy) to open the channels and soften the toxins. The patient is given a specific diet and lifestyle modifications. Internal oleation with ghee or oil is administered to mobilize toxins from deep tissues to the digestive tract. This phase typically lasts 7-10 days and is crucial for the success of the main procedure."
        },
        {
          title: "Main Procedure (Pradhana Karma)",
          videoUrl: "https://www.youtube.com/embed/-RTwcKF8rH8",
          transcript: "The main Vamana procedure begins early in the morning on an empty stomach. The patient is given emetic substances like Madanaphala (Randia dumetorum) mixed with honey, rock salt, and other ingredients. The therapist monitors the patient closely as vomiting is induced. The process continues until the patient vomits clear water, indicating complete cleansing. This procedure typically lasts 2-4 hours and requires skilled supervision. The patient may experience 8-12 bouts of vomiting to achieve complete purification of the upper digestive tract and respiratory system."
        },
        {
          title: "Post Care (Paschat Karma)",
          videoUrl: "https://www.youtube.com/embed/PmyAOzD8bE0",
          transcript: "After Vamana therapy, the patient enters a crucial recovery phase. Initially, only warm water and light gruel are given. Gradually, the diet is expanded to include easily digestible foods. The patient must avoid cold, heavy, and oily foods for several days. Rest and proper sleep are essential for recovery. The therapist monitors vital signs and provides supportive treatments like gentle massage and warm compresses. This phase lasts 7-14 days and is vital for restoring strength and ensuring the therapy's benefits are fully realized."
        }
      ]
    },
    {
      name: "Virechana",
      description: "Purgation therapy that balances Pitta dosha by cleansing the intestines and liver. This treatment helps remove toxins through the lower digestive tract and promotes healthy elimination.",
      subdivisions: [
        {
          title: "Preparation (Purva Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Virechana preparation involves deep oleation therapy to mobilize toxins from the liver and blood. The patient undergoes Snehana with Pitta-pacifying oils for 5-7 days. Internal oleation with medicated ghee helps draw toxins from deep tissues. Swedana therapy opens the channels and prepares the body for elimination. A specific diet rich in bitter and astringent tastes is recommended. The patient must avoid spicy, sour, and hot foods. This preparation phase is essential for effective toxin mobilization and safe purgation."
        },
        {
          title: "Main Procedure (Pradhana Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "The main Virechana procedure involves administering purgative substances like Trivrit (Operculina turpethum) or other Pitta-pacifying herbs. The purgative is given in the morning on an empty stomach. The therapist monitors the patient as purgation begins, typically within 2-4 hours. The process continues until the patient passes clear water, indicating complete cleansing of the intestines and liver. This procedure may last 6-12 hours and requires constant supervision. The patient experiences multiple bowel movements to eliminate accumulated toxins and excess Pitta dosha."
        },
        {
          title: "Post Care (Paschat Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Post-Virechana care focuses on restoring digestive fire and strength. The patient begins with warm water and light gruel, gradually progressing to easily digestible foods. Cooling and nourishing foods are emphasized to balance Pitta. The patient must avoid hot, spicy, and sour foods for several days. Rest and proper hydration are crucial. The therapist provides supportive treatments and monitors for any complications. This recovery phase lasts 7-10 days and is essential for consolidating the therapy's benefits."
        }
      ]
    },
    {
      name: "Basti",
      description: "Enema therapy that regulates Vata dosha through medicated enemas. This powerful treatment nourishes the body while eliminating toxins and is considered the most important Panchakarma therapy.",
      subdivisions: [
        {
          title: "Preparation (Purva Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Basti preparation involves extensive oleation therapy to prepare the colon and mobilize Vata. The patient undergoes Snehana with Vata-pacifying oils for 7-10 days. Internal oleation with medicated ghee helps lubricate the digestive tract. Swedana therapy opens the channels and prepares the body. A Vata-pacifying diet with warm, moist, and nourishing foods is essential. The patient must avoid cold, dry, and rough foods. This preparation phase is crucial for the success of Basti therapy and typically lasts 10-15 days."
        },
        {
          title: "Niruha Basti (Cleansing Enema)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Niruha Basti is the cleansing enema that eliminates toxins and excess Vata. It contains decoctions of Vata-pacifying herbs, honey, rock salt, and medicated oils. The enema is administered in the morning after proper preparation. The patient retains the enema for 15-30 minutes before elimination. This procedure is repeated for 5-15 days depending on the condition. Niruha Basti helps cleanse the colon, remove toxins, and balance Vata dosha. It's particularly effective for digestive disorders, neurological conditions, and musculoskeletal problems."
        },
        {
          title: "Anuvasana Basti (Oil Enema)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Anuvasana Basti is the nourishing oil enema that provides deep nourishment and strengthens the body. It contains medicated oils with Vata-pacifying herbs. This enema is administered after Niruha Basti or as a standalone treatment. The patient retains the oil for 1-2 hours for maximum absorption. Anuvasana Basti nourishes the tissues, strengthens the nervous system, and provides deep healing. It's particularly beneficial for weakness, debility, and chronic Vata disorders. This treatment is often alternated with Niruha Basti for optimal results."
        },
        {
          title: "Post Care (Paschat Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Post-Basti care is crucial for maintaining the therapy's benefits. The patient follows a Vata-pacifying diet with warm, moist, and nourishing foods. Regular oil massage and warm baths help maintain the therapeutic effects. The patient must avoid cold, dry, and rough foods. Proper rest and stress management are essential. The therapist monitors the patient's progress and provides supportive treatments. This care phase lasts 15-30 days and is vital for consolidating the deep healing effects of Basti therapy."
        }
      ]
    },
    {
      name: "Nasya",
      description: "Nasal therapy that cleanses the head region and upper respiratory tract. This treatment administers medicated oils or powders through the nostrils to treat conditions affecting the head and neck.",
      subdivisions: [
        {
          title: "Preparation (Purva Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Nasya preparation involves cleansing the head and neck region. The patient undergoes gentle massage of the head, neck, and shoulders with medicated oils. Steam therapy helps open the nasal passages and prepare the area. The patient must avoid cold foods and exposure to cold air. A light diet is recommended to avoid congestion. This preparation phase typically lasts 3-5 days and is essential for effective nasal administration and absorption of the medicated substances."
        },
        {
          title: "Oil Nasya (Sneha Nasya)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Oil Nasya involves administering medicated oils through the nostrils. The patient lies in a supine position with the head tilted back. Warm medicated oil is instilled drop by drop into each nostril. The patient inhales deeply to draw the oil into the nasal passages and sinuses. This treatment helps lubricate the nasal passages, improves circulation, and provides nourishment to the head region. Oil Nasya is particularly beneficial for dryness, headaches, and neurological conditions. The treatment is typically administered for 7-14 days."
        },
        {
          title: "Powder Nasya (Churna Nasya)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Powder Nasya involves administering fine medicated powders through the nostrils. The patient inhales the powder through each nostril alternately. This treatment helps cleanse the nasal passages, reduce congestion, and eliminate toxins from the head region. Powder Nasya is particularly effective for sinusitis, nasal congestion, and respiratory disorders. The treatment stimulates the nasal mucosa and helps clear accumulated mucus and toxins. This procedure is typically performed for 5-10 days depending on the condition."
        },
        {
          title: "Post Care (Paschat Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Post-Nasya care involves protecting the head and neck region. The patient must avoid cold exposure, wind, and dust. Warm foods and drinks are recommended to maintain the therapeutic effects. Gentle massage of the head and neck helps maintain circulation. The patient should avoid excessive talking, reading, or screen time. Proper rest and sleep are essential for recovery. This care phase typically lasts 3-7 days and is crucial for maintaining the benefits of Nasya therapy."
        }
      ]
    },
    {
      name: "Rakta Moksha",
      description: "Bloodletting therapy that detoxifies the blood by removing impure blood. This specialized treatment helps eliminate toxins from the bloodstream and improves overall circulation and health.",
      subdivisions: [
        {
          title: "Preparation (Purva Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Rakta Moksha preparation involves assessing the patient's blood quality and overall health. The patient undergoes Snehana and Swedana to mobilize toxins into the blood. A Pitta-pacifying diet helps prepare the blood for purification. The patient must avoid hot, spicy, and sour foods. Blood tests may be performed to assess the current state. This preparation phase typically lasts 5-7 days and is essential for safe and effective bloodletting. The therapist evaluates the patient's suitability for the procedure."
        },
        {
          title: "Leech Therapy (Jalauka)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Leech therapy is a gentle form of bloodletting using medicinal leeches. The leeches are applied to specific points on the body where toxins have accumulated. They naturally extract impure blood while releasing beneficial enzymes. This method is particularly effective for skin disorders, inflammatory conditions, and localized blood stagnation. The procedure is relatively painless and provides precise blood removal. Leech therapy is often preferred for sensitive areas and provides additional therapeutic benefits through the leeches' natural healing properties."
        },
        {
          title: "Venipuncture (Sira Vyadha)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Venipuncture involves carefully extracting blood from specific veins using sterile techniques. The procedure is performed by trained therapists using appropriate medical instruments. Small amounts of blood are removed from strategic points to eliminate toxins and improve circulation. This method is particularly effective for systemic blood purification and treating blood-related disorders. The procedure requires precise knowledge of anatomy and proper sterilization techniques. Venipuncture is often combined with other Panchakarma treatments for comprehensive detoxification."
        },
        {
          title: "Post Care (Paschat Karma)",
          videoUrl: "https://www.youtube.com/embed/DG6FJWlKOV4",
          transcript: "Post-Rakta Moksha care focuses on blood regeneration and wound healing. The patient follows a Pitta-pacifying diet rich in iron and blood-building nutrients. Cooling foods and drinks help balance the blood. Proper wound care is essential for any puncture sites. The patient must avoid hot, spicy, and sour foods that can aggravate the blood. Rest and proper hydration are crucial for recovery. This care phase typically lasts 7-14 days and is essential for complete healing and blood regeneration."
        }
      ]
    }
  ];

  // State to track the currently selected therapy and subdivision
  const [selectedTherapy, setSelectedTherapy] = useState(0);
  const [selectedSubdivision, setSelectedSubdivision] = useState(0);

  // Get the currently selected therapy and subdivision data
  const currentTherapy = therapiesData[selectedTherapy];
  const currentSubdivision = currentTherapy?.subdivisions[selectedSubdivision];

  // Handle therapy selection
  const handleTherapySelect = (therapyIndex) => {
    setSelectedTherapy(therapyIndex);
    setSelectedSubdivision(0); // Reset to first subdivision when therapy changes
  };

  // Handle subdivision selection
  const handleSubdivisionSelect = (subdivisionIndex) => {
    setSelectedSubdivision(subdivisionIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-1">
            Panchakarma Educational Repository
          </h1>
          <p className="text-sm md:text-lg text-gray-600">
            Explore the five main Panchakarma therapies and their detailed procedures
          </p>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Sidebar - Therapy List with Subdivisions */}
            <aside className="md:col-span-1">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Panchakarma Therapies</h2>
                <div className="space-y-3">
                  {therapiesData.map((therapy, therapyIndex) => (
                    <div key={therapyIndex}>
                      <button
                        onClick={() => handleTherapySelect(therapyIndex)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex flex-col ${
                          selectedTherapy === therapyIndex
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{therapy.name}</div>
                        <div className={`text-sm mt-1 ${selectedTherapy === therapyIndex ? 'text-blue-100' : 'text-gray-500'}`}>
                          {therapy.description.substring(0, 80)}{therapy.description.length > 80 ? '...' : ''}
                        </div>
                      </button>

                      {selectedTherapy === therapyIndex && (
                        <div className="mt-2 ml-3 space-y-2">
                          {therapy.subdivisions.map((subdivision, subdivisionIndex) => (
                            <button
                              key={subdivisionIndex}
                              onClick={() => handleSubdivisionSelect(subdivisionIndex)}
                              className={`w-full text-left p-2 rounded-md text-sm transition-all duration-150 ${
                                selectedSubdivision === subdivisionIndex
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                              }`}
                            >
                              {subdivision.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Content Area */}
            <main className="md:col-span-2">
              {currentTherapy && currentSubdivision && (
                <div className="space-y-6">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{currentTherapy.name}</span>
                    <span className="mx-2">→</span>
                    <span className="text-gray-600">{currentSubdivision.title}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{currentSubdivision.title}</h2>
                    <p className="text-md md:text-lg text-gray-600 leading-relaxed">{currentTherapy.description}</p>
                  </div>

                  {/* Responsive video container */}
                  <div className="rounded-lg overflow-hidden shadow">
                    <div className="w-full bg-black" style={{position: 'relative', paddingTop: '56.25%'}}>
                      <iframe
                        src={currentSubdivision.videoUrl}
                        title={`${currentSubdivision.title} Video`}
                        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Procedure Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{currentSubdivision.transcript}</p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Educational content for learning about traditional Panchakarma therapies and procedures
        </div>
      </div>
    </div>
  );
};

export default PanchakarmaRepo;