const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const testId = 1;
  
  console.log('=== DETAILED PLACEMENT TEST ANALYSIS ===\n');
  
  const groups = await prisma.question_groups.findMany({
    where: { test_id: testId },
    orderBy: [{ part: 'asc' }, { display_order: 'asc' }]
  });
  
  // Analyze each part
  for (const part of [1, 2, 3, 4, 5, 6, 7]) {
    const partGroups = groups.filter(g => g.part === part);
    console.log(`\n=== PART ${part} ===`);
    console.log(`Total groups: ${partGroups.length}`);
    
    let totalQuestions = 0;
    let totalPassageWords = 0;
    let totalQuestionWords = 0;
    let totalOptionWords = 0;
    let passageCount = 0;
    
    for (const group of partGroups) {
      const questions = await prisma.questions.findMany({
        where: { group_id: group.id },
        include: { options: true }
      });
      
      totalQuestions += questions.length;
      
      // Count passage words
      if (group.passage) {
        const words = group.passage.split(/\s+/).length;
        totalPassageWords += words;
        passageCount++;
      }
      
      // Count question and option words
      for (const q of questions) {
        if (q.question_text) {
          totalQuestionWords += q.question_text.split(/\s+/).length;
        }
        for (const opt of q.options) {
          if (opt.option_text) {
            totalOptionWords += opt.option_text.split(/\s+/).length;
          }
        }
      }
    }
    
    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Questions per group: ${(totalQuestions / partGroups.length).toFixed(1)}`);
    
    if (passageCount > 0) {
      console.log(`Passages: ${passageCount}`);
      console.log(`Avg passage words: ${(totalPassageWords / passageCount).toFixed(1)}`);
    }
    
    console.log(`Avg question words: ${(totalQuestionWords / totalQuestions).toFixed(1)}`);
    console.log(`Avg option words: ${(totalOptionWords / (totalQuestions * 4)).toFixed(1)}`);
    
    // Show sample group details
    if (partGroups.length > 0) {
      const sampleGroup = partGroups[0];
      const sampleQuestions = await prisma.questions.findMany({
        where: { group_id: sampleGroup.id },
        include: { options: true }
      });
      
      console.log('\nSample group details:');
      console.log(`  Group ID: ${sampleGroup.id}`);
      console.log(`  Group type: ${sampleGroup.group_type}`);
      console.log(`  Image URL: ${sampleGroup.image_url || 'N/A'}`);
      console.log(`  Audio URL: ${sampleGroup.audio_url || 'N/A'}`);
      console.log(`  Audio start: ${sampleGroup.audio_start_time}, end: ${sampleGroup.audio_end_time}`);
      
      if (sampleGroup.passage) {
        console.log(`  Passage length: ${sampleGroup.passage.split(/\s+/).length} words`);
        console.log(`  Passage preview: ${sampleGroup.passage.substring(0, 150)}...`);
      }
      
      console.log(`  Questions in group: ${sampleQuestions.length}`);
      if (sampleQuestions.length > 0) {
        const q = sampleQuestions[0];
        console.log(`  Sample question: ${q.question_text || '(no text - listening)'}`);
        console.log(`  Correct answer: ${q.correct_answer}`);
        console.log(`  Has explanation: ${q.explanation ? 'Yes' : 'No'}`);
      }
    }
  }
  
  // Check audio file structure
  console.log('\n=== AUDIO STRUCTURE ===');
  const audioGroups = groups.filter(g => g.audio_url);
  console.log(`Groups with audio: ${audioGroups.length}`);
  const uniqueAudioUrls = [...new Set(audioGroups.map(g => g.audio_url))];
  console.log(`Unique audio files: ${uniqueAudioUrls.length}`);
  console.log(`Audio files: ${uniqueAudioUrls.join(', ')}`);
  
  // Check image structure
  console.log('\n=== IMAGE STRUCTURE ===');
  const imageGroups = groups.filter(g => g.image_url);
  console.log(`Groups with images: ${imageGroups.length}`);
  const uniqueImageUrls = [...new Set(imageGroups.map(g => g.image_url))];
  console.log(`Unique image files: ${uniqueImageUrls.length}`);
  console.log(`Image files: ${uniqueImageUrls.join(', ')}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
