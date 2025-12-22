import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const imagesDir = path.join(rootDir, 'public', 'images', 'wengines')
const dataFile = path.join(rootDir, 'public', 'wengine-data.json')

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file)
          file.on('finish', () => {
            file.close()
            resolve()
          })
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          file.close()
          fs.unlinkSync(filepath)
          downloadFile(response.headers.location, filepath).then(resolve).catch(reject)
        } else {
          file.close()
          fs.unlinkSync(filepath)
          reject(new Error(`Failed to download: ${response.statusCode}`))
        }
      })
      .on('error', (err) => {
        file.close()
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
        reject(err)
      })
  })
}

async function fetchWEngines() {
  console.log('Fetching w-engine data...')
  
  return new Promise((resolve, reject) => {
    https.get('https://api.hakush.in/zzz/data/weapon.json', (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const wengines = JSON.parse(data)
          resolve(wengines)
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}   

async function downloadWEngineImages(wengines) {
  const imagePromises = []
  
  for (const [id, wengine] of Object.entries(wengines)) {
    if (!wengine.icon) {
      console.warn(`No icon property for ${wengine.name} (ID: ${id}), skipping...`)
      continue
    }

    // Icon image: IconRoleCrop{number}.webp (e.g., IconRoleCrop01.webp)
    const iconUrl = `https://api.hakush.in/zzz/UI/${wengine.icon}.webp`
    const iconPath = path.join(imagesDir, `${wengine.icon}.webp`)
    
    // Download icon
    imagePromises.push(
      downloadFile(iconUrl, iconPath).catch((err) => {
        console.warn(`Failed to download icon for ${wengine.name}: ${err.message}`)
      })
    )
  }
  
  await Promise.all(imagePromises)
  console.log('All images downloaded!')
}

function transformWEngineData(wengines) {
  const transformed = {}
  
  for (const [id, wengine] of Object.entries(wengines)) {
    if (!wengine.icon) {
      console.warn(`No icon property for ${wengine.name} (ID: ${id}), skipping...`)
      continue
    }
    
    transformed[id] = {
      id,
      name: wengine.EN,
      rank: wengine.rank,
      type: wengine.type,
      iconUrl: `/images/wengines/${wengine.icon}.webp`
    }
  }
  
  return transformed
}

async function main() {
  try {
    const wengines = await fetchWEngines()
    console.log(`Found ${Object.keys(wengines).length} wengines`)
    
    await downloadWEngineImages(wengines)
    
    const transformed = transformWEngineData(wengines)
    
    fs.writeFileSync(dataFile, JSON.stringify(transformed, null, 2))
    console.log(`W-Engine data saved to ${dataFile}`)
    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
