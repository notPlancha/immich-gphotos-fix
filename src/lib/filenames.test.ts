import { describe, expect as e, test as t } from 'bun:test'
import { dateFromFilename, getSidecarFilenames } from './filenames.ts'
import { debug, setDebug } from './log.ts'
import { DateTime } from 'luxon'

// setDebug(true)

// flags: edited, dupe(1), longName, extensions
describe('getSidecarFilenames', () => {
	const f = getSidecarFilenames

	function two(asset: string, sidecar: string) {
		e(f(asset)).toContain(sidecar)
	}

	function three(asset: string, editedAsset: string, sidecar: string) {
		two(asset, sidecar)
		two(editedAsset, sidecar)
	}

	describe('strange', () => {
		t('jpg drop dupe verylongname + edited', () => {
			three(
				'image-bf585df5c19f02ae117f3797a074f099b3ab9f9ab.jpg', // 51 chars
				'image-bf585df5c19f02ae117f3797a074f099b3ab9f9ab(1).jpg', // 54 chars. this appears to be the edited version
				'image-bf585df5c19f02ae117f3797a074f099b3ab9f9a.json', // 51 chars
			)
		})
		t('jpg keep dupe in same position', () => {
			two('2014-06-22(1).jpg', '2014-06-22(1).jpg.supplemental-metadata.json')
		})
		t('jpg keep dupe in same position longname', () => {
			two('hangout_snapshot_0(3).jpg', 'hangout_snapshot_0(3).jpg.supplemental-metadat.json')
		})
	})

	describe('jpg', () => {
		t('.jpg', () => {
			two('IMG_20140713_131416.jpg', 'IMG_20140713_131416.jpg.supplemental-metadata.json')
			two('hangout_snapshot_0.jpg', 'hangout_snapshot_0.jpg.supplemental-metadata.json')
			two('2014-06-22.jpg', '2014-06-22.jpg.supplemental-metadata.json')
		})
		t('JPG uppercase', () => {
			three(
				'IMG_20150123_195955.JPG',
				'IMG_20150123_195955-edited.JPG',
				'IMG_20150123_195955.JPG.supplemental-metadata.json',
			)
		})
		t('-edited', () => {
			two('IMG-20140922-WA0000-edited.jpg', 'IMG-20140922-WA0000.jpg.supplemental-metadata.json')
		})
		t('longname', () => {
			two('11267559_10152906191670949_1479236175_o.jpg', '11267559_10152906191670949_1479236175_o.jpg.su.json')
			two('11296446_10152906229660949_306649535_o.jpg', '11296446_10152906229660949_306649535_o.jpg.sup.json')
		})
		t('longname + edited', () => {
			three(
				'04d0fd9dc8abd6fac3014db0cd05d0ba.jpg',
				'04d0fd9dc8abd6fac3014db0cd05d0ba-edited.jpg',
				'04d0fd9dc8abd6fac3014db0cd05d0ba.jpg.supplemen.json',
			)
		})
		t('+ edited', () => {
			three('barry-poster-2.jpg', 'barry-poster-2-edited.jpg', 'barry-poster-2.jpg.supplemental-metadata.json')
		})
		t('dupe', () => {
			two('barry-poster-2(1).jpg', 'barry-poster-2.jpg.supplemental-metadata(1).json')
		})
		t('double dupe longname', () => {
			two('hangout_snapshot_0(1)(1).jpg', 'hangout_snapshot_0(1).jpg.supplemental-metadat(1).json')
			two('hangout_snapshot_0(1)(3).jpg', 'hangout_snapshot_0(1).jpg.supplemental-metadat(3).json')
		})
	})

	describe('jpeg', () => {
		t('+ edited', () => {
			three(
				'IMG-20141013-WA0001.jpeg',
				'IMG-20141013-WA0001-edited.jpeg',
				'IMG-20141013-WA0001.jpeg.supplemental-metadata.json',
			)
		})
		t('longname + edited', () => {
			three(
				'received_10152408911805949.jpeg',
				'received_10152408911805949-edited.jpeg',
				'received_10152408911805949.jpeg.supplemental-m.json',
			)
		})
	})

	describe('mov', () => {
		t('.MOV', () => {
			two('mom haircut.MOV', 'mom haircut.MOV.supplemental-metadata.json')
		})
	})

	describe('m4v', () => {
		t('.m4v', () => {
			two('MOVIE.m4v', 'MOVIE.m4v.supplemental-metadata.json')
		})
		t('dupe', () => {
			two('MOVIE(1).m4v', 'MOVIE.m4v.supplemental-metadata(1).json')
		})
	})

	describe('gif', () => {
		t('longname', () => {
			two('hangout_snapshot_0-MOTION.gif', 'hangout_snapshot_0-MOTION.gif.supplemental-met.json')
			two('hangout_snapshot_1-MOTION.gif', 'hangout_snapshot_1-MOTION.gif.supplemental-met.json')
		})
	})

	describe('png', () => {
		t('+ edited', () => {
			three(
				'hangout_snapshot_0.png',
				'hangout_snapshot_0-edited.png',
				'hangout_snapshot_0.png.supplemental-metadata.json',
			)
			three(
				'hangout_snapshot_0.png',
				'hangout_snapshot_0-edited.png',
				'hangout_snapshot_0.png.supplemental-metadata.json',
			)
		})
		t('dupe 1-digit + edited', () => {
			three(
				'hangout_snapshot_0(3).png',
				'hangout_snapshot_0-edited(3).png',
				'hangout_snapshot_0.png.supplemental-metadata(3).json',
			)
			three(
				'hangout_snapshot_0(1).png',
				'hangout_snapshot_0-edited(1).png',
				'hangout_snapshot_0.png.supplemental-metadata(1).json',
			)
		})
		t('dupe 2-digit + edited', () => {
			three(
				'hangout_snapshot_0(10).png',
				'hangout_snapshot_0-edited(10).png',
				'hangout_snapshot_0.png.supplemental-metadata(10).json',
			)
			three(
				'hangout_snapshot_0(14).png',
				'hangout_snapshot_0-edited(14).png',
				'hangout_snapshot_0.png.supplemental-metadata(14).json',
			)

			three(
				'hangout_snapshot_0(24).png',
				'hangout_snapshot_0-edited(24).png',
				'hangout_snapshot_0.png.supplemental-metadata(24).json',
			)
		})
		t('longname', () => {
			two('Screenshot_2014-12-18-10-50-54.png', 'Screenshot_2014-12-18-10-50-54.png.supplementa.json')
			two('Capture+_2015-11-04-10-57-37.png', 'Capture+_2015-11-04-10-57-37.png.supplemental-.json')
		})
	})
})

describe('dateFromFilename', () => {
	describe('whatsapp', () => {
		describe('parsed to Noon UTC on the date', () => {
			const dates = [
				['IMG-20160425-WA0000.jpg', '2016-04-25T12:00:00Z'],
				['IMG-20160519-WA0000.jpg', '2016-05-19T12:00:00Z'],
				['IMG-20160731-WA0000.jpg', '2016-07-31T12:00:00Z'],
				['IMG-20160827-WA0000.jpg', '2016-08-27T12:00:00Z'],
				['IMG-20160907-WA0002.jpg', '2016-09-07T12:00:00Z'],
				['IMG-20161008-WA0000.jpg', '2016-10-08T12:00:00Z'],
				['IMG-20161008-WA0001.jpg', '2016-10-08T12:00:00Z'],
				['IMG-20161008-WA0002.jpg', '2016-10-08T12:00:00Z'],
				['IMG-20161019-WA0002.jpg', '2016-10-19T12:00:00Z'],
				['IMG-20161019-WA0031.jpg', '2016-10-19T12:00:00Z'],
				['IMG-20161216-WA0000.jpg', '2016-12-16T12:00:00Z'],
				['IMG-20161216-WA0001.jpg', '2016-12-16T12:00:00Z'],
				['IMG-20161216-WA0002.jpg', '2016-12-16T12:00:00Z'],
				['IMG-20161216-WA0003.jpg', '2016-12-16T12:00:00Z'],
				['IMG-20161216-WA0004.jpg', '2016-12-16T12:00:00Z'],
				['IMG-20161216-WA0005.jpg', '2016-12-16T12:00:00Z'],
			] as const

			// %p == pretty-format
			t.each(dates)('%p', (whatsappFilename, isoExpected) => {
				const dtFilename = dateFromFilename(whatsappFilename)
				const dtExpected = DateTime.fromISO(isoExpected, { zone: 'UTC' })
				debug('expected:', isoExpected, '-->', dtExpected)

				e(dtFilename.toISO()).toBe(dtExpected.toISO())
				e(dtFilename.equals(dtExpected)).toBe(true)
				e(+dtFilename).toBe(+dtExpected)
			})
		})
	})
})
