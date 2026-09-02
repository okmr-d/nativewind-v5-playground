import './global.css'
import React, { useState } from 'react'
import {
  Image,
  Platform,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'

/** 記事の見出し番号と対応する検証セクション */
const Section = ({
  no,
  title,
  children,
}: {
  no: string
  title: string
  children: React.ReactNode
}) => (
  <View className="border-b border-gray-300 px-4 py-5">
    <Text className="mb-3 text-[16px] font-bold text-black dark:text-white">
      {no} {title}
    </Text>
    {children}
  </View>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-1 mt-3 text-[12px] text-gray-500 dark:text-gray-400">
    {children}
  </Text>
)

/** 子要素の実測サイズを表示するヘルパー */
const Measured = ({
  children,
  axis = 'height',
}: {
  children: React.ReactElement
  axis?: 'height' | 'width'
}) => {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  return (
    <View className="flex-row items-center gap-2">
      <View
        onLayout={(e) =>
          setSize({
            w: e.nativeEvent.layout.width,
            h: e.nativeEvent.layout.height,
          })
        }
      >
        {children}
      </View>
      <Text className="text-[11px] text-pink-600">
        {size
          ? axis === 'height'
            ? `h=${size.h.toFixed(1)}`
            : `w=${size.w.toFixed(1)}`
          : '...'}
      </Text>
    </View>
  )
}

/** ⑥c: inset-0+maxHeight と top-0+h-full+maxHeight の絶対配置を実測比較 */
const OverlayProbe = () => {
  const [a, setA] = useState<{ y: number; height: number } | null>(null)
  const [b, setB] = useState<{ y: number; height: number } | null>(null)
  return (
    <View className="gap-1">
      <Label>親: relative h-64(256dp)。オーバーレイに max-h-[100px]</Label>
      <View className="flex-row gap-4">
        <View className="relative h-64 w-36 bg-gray-200">
          <View
            className="absolute inset-0 max-h-[100px] bg-red-500/70"
            onLayout={(e) => {
              setA(e.nativeEvent.layout)
              // eslint-disable-next-line no-console
              console.log('[probe] A inset-0+max-h:', JSON.stringify(e.nativeEvent.layout))
            }}
          />
        </View>
        <View className="relative h-64 w-36 bg-gray-200">
          <View
            className="absolute inset-x-0 top-0 h-full max-h-[100px] bg-green-600/70"
            onLayout={(e) => {
              setB(e.nativeEvent.layout)
              // eslint-disable-next-line no-console
              console.log('[probe] B top-0+h-full+max-h:', JSON.stringify(e.nativeEvent.layout))
            }}
          />
        </View>
      </View>
      <Text className="text-[12px] text-pink-600">
        A(inset-0 + max-h): y={a ? a.y.toFixed(1) : '?'} h={a ? a.height.toFixed(1) : '?'} / 期待:
        y=0 h=100
      </Text>
      <Text className="text-[12px] text-pink-600">
        B(top-0 + h-full + max-h): y={b ? b.y.toFixed(1) : '?'} h={b ? b.height.toFixed(1) : '?'} /
        期待: y=0 h=100
      </Text>
    </View>
  )
}

const Box = ({ className, label }: { className?: string; label: string }) => (
  <View className={`items-center justify-center ${className ?? ''}`}>
    <Text className="text-[10px] text-white">{label}</Text>
  </View>
)

/** 比較結果を示すチップ(スクショ単体で意味が伝わるように) */
const Chip = ({
  kind,
  children,
}: {
  kind: 'ok' | 'ng' | 'warn'
  children: React.ReactNode
}) => (
  <View
    className={`self-start rounded-full px-2 py-[2px] ${
      kind === 'ok' ? 'bg-green-100' : kind === 'ng' ? 'bg-red-100' : 'bg-yellow-100'
    }`}
  >
    <Text
      className={`text-[11px] font-medium ${
        kind === 'ok' ? 'text-green-800' : kind === 'ng' ? 'text-red-700' : 'text-yellow-800'
      }`}
    >
      {kind === 'ok' ? '✅ ' : kind === 'ng' ? '❌ ' : '⚠️ '}
      {children}
    </Text>
  </View>
)

export default function App() {
  const scheme = useColorScheme()
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style="auto" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 60, paddingBottom: 60 }}>
        <Text className="px-4 text-[20px] font-bold text-black dark:text-white">
          NativeWind v5 検証 ({Platform.OS} / {scheme})
        </Text>

        <Section no="①" title="display: grid は無視 / flex-direction は column">
          <Label>`grid grid-cols-3` → 無視されて縦積みのまま</Label>
          <View className="grid grid-cols-3">
            <Box className="h-8 w-20 bg-blue-500" label="A" />
            <Box className="h-8 w-20 bg-blue-600" label="B" />
            <Box className="h-8 w-20 bg-blue-700" label="C" />
          </View>
          <Label>`flex` のみ(flex-row なし)→ 縦積み(column がデフォルト)</Label>
          <View className="flex">
            <Box className="h-8 w-20 bg-teal-500" label="A" />
            <Box className="h-8 w-20 bg-teal-600" label="B" />
          </View>
          <Label>`flex-row` → 横並び</Label>
          <View className="flex-row">
            <Box className="h-8 w-20 bg-teal-500" label="A" />
            <Box className="h-8 w-20 bg-teal-600" label="B" />
          </View>
        </Section>

        <Section no="②" title="flex の意味と flexShrink のデフォルトが違う">
          <Label>3兄弟全員 flex-1 → 1/3 ずつ</Label>
          <View className="h-8 flex-row">
            <Box className="flex-1 bg-orange-400" label="1/3" />
            <Box className="flex-1 bg-orange-500" label="1/3" />
            <Box className="flex-1 bg-orange-600" label="1/3" />
          </View>
          <Label>w-40(140px)× 3 = 計 420px を親(枠線)に並べる → Web なら縮んで収まる</Label>
          <View className="flex-row border border-gray-400">
            <Box className="h-8 w-40 bg-cyan-600" label="w-40" />
            <Box className="h-8 w-40 bg-cyan-700" label="w-40" />
            <Box className="h-8 w-40 bg-cyan-800" label="w-40" />
          </View>
          <Chip kind="ng">flexShrink のデフォルトが 0(Web は 1)なので縮まず、親をはみ出す</Chip>
        </Section>

        <Section no="③" title="% 幅と画像のサイズ指定">
          <Label>`w-[50%]` の箱(親: 画面幅)</Label>
          <Box className="h-8 w-[50%] bg-purple-500" label="w-[50%]" />
          <Label>`h-[50%]` は親の高さ次第(左: 親 h-16(56px)あり / 右: 親の高さ指定なし)</Label>
          <View className="gap-1">
            <Chip kind="ok">親の高さがあれば 27 = 枠の内側 54px の 50%(左)</Chip>
            <Chip kind="ng">親の高さが未指定だと 50% にならず、囲い方で変わる不定値になる(右)</Chip>
          </View>
          <View className="mt-1 flex-row gap-4">
            <View className="h-16 w-24 border border-gray-400">
              <View
                className="h-[50%] w-full bg-purple-500"
                onLayout={(e) => {
                  // eslint-disable-next-line no-console
                  console.log('[probe] h50% (parent h-16) h=', e.nativeEvent.layout.height)
                }}
              />
            </View>
            {/* 高さ未指定の親に % を入れると 1000px 超の不定値に暴発しレイアウトを壊すため、
                表示用の窓(h-16 + overflow-hidden)でクリップしている。
                窓を挟むと解決値自体も変わる(裸: 527/1063、窓あり: 13.7)= 予測不能 */}
            <View className="h-16 w-24 overflow-hidden">
              <View className="w-24 border border-gray-400">
                <View
                  className="h-[50%] w-full bg-purple-500"
                  onLayout={(e) => {
                    // eslint-disable-next-line no-console
                    console.log('[probe] h50% (parent auto) h=', e.nativeEvent.layout.height)
                  }}
                />
              </View>
            </View>
          </View>
          <Label>サイズ未指定のローカル Image → 原寸(1024px)で描画されてしまう</Label>
          <View className="flex-row items-center gap-2 bg-gray-100">
            <Image source={require('./assets/icon.png')} />
            <Text className="text-[11px] text-black dark:text-white">
              ←ここにサイズ未指定 Image
            </Text>
          </View>
          <Label>w/h 指定あり Image(w-8 h-8)</Label>
          <Image source={require('./assets/icon.png')} className="h-8 w-8" />
        </Section>

        <Section no="④" title="View にテキスト装飾を書いても効かない">
          <Label>{'<View className="text-red-500 text-[20px]"> 内の <Text>'}</Label>
          <View className="text-red-500 text-[20px]">
            <Text>赤くも大きくもならない</Text>
          </View>
        </Section>

        <Section no="⑤" title="overflow ではスクロールしない">
          <Label>h-16 + overflow-y-auto の View に長文 → スクロールできない</Label>
          <View className="h-16 overflow-y-auto border border-gray-400 p-1">
            <Text className="text-[12px] text-black dark:text-white">
              1行目 これは overflow-y-auto を指定した View の中の長いコンテンツです。{'\n'}
              2行目 Web ならスクロールできますが…{'\n'}3行目{'\n'}4行目{'\n'}5行目{'\n'}
              6行目 ここまで見えたらスクロールできてしまっている
            </Text>
          </View>
        </Section>

        <Section no="⑥" title="position: fixed は存在しない">
          <Label>`fixed bottom-0` の箱 → 画面固定にならず、この場に留まる</Label>
          <Box className="h-8 w-40 fixed bottom-0 bg-red-500" label="fixed bottom-0" />
        </Section>

        <Section no="⑥b" title="max-h の任意値は効くか">
          <Label>h-[80px] + max-h-[40px] → 40 になれば効いている</Label>
          <Measured>
            <Box className="h-[80px] max-h-[40px] w-24 bg-violet-500" label="max-h" />
          </Measured>
        </Section>

        <Section no="⑥c" title="【記事対象外】inset-0 + maxHeight(RN 0.83 では衝突は再現せず)">
          <OverlayProbe />
        </Section>

        <Section no="⑦" title="px は dp(w-[100px] の実測)">
          <Measured axis="width">
            <Box className="h-8 w-[100px] bg-cyan-600" label="w-[100px]" />
          </Measured>
        </Section>

        <Section no="⑧" title="スタイル継承(View からは継承されない / Text ネストは継承)">
          <Label>{'<View className="text-red-500"> 内の <Text>'}</Label>
          <View className="text-red-500">
            <Text>View の文字色は継承されない(黒のまま)</Text>
          </View>
          <Label>{'<Text className="text-red-500"> 内の <Text>'}</Label>
          <Text className="text-red-500">
            外側Text <Text>ネストした Text は赤を継承する</Text>
          </Text>
        </Section>

        <Section no="⑨" title="フォント(font-bold の効き)">
          <Label>システムフォント + font-bold</Label>
          <Text className="font-bold text-black dark:text-white">太字テスト Bold Test</Text>
          <Label>font-sans 指定</Label>
          <Text className="font-sans text-black dark:text-white">font-sans テスト</Text>
        </Section>

        <Section no="⑩" title="leading-[1.4](unitless)は無視される">
          <Label>背景の黄色 = 行ボックスの高さ。h= は実測値(dp)</Label>
          <Label>text-[12px] のみ(比較基準: 自然な行高)</Label>
          <Measured>
            <Text className="bg-yellow-200 text-[12px] text-black">あア gy</Text>
          </Measured>
          <Label>+ leading-[1.4]</Label>
          <View className="flex-row items-center gap-3">
            <Measured>
              <Text className="bg-yellow-200 text-[12px] leading-[1.4] text-black">あア gy</Text>
            </Measured>
            <Chip kind="ng">無視される(基準と同じ高さ)</Chip>
          </View>
          <Label>+ leading-5</Label>
          <View className="flex-row items-center gap-3">
            <Measured>
              <Text className="bg-yellow-200 text-[12px] leading-5 text-black">あア gy</Text>
            </Measured>
            <Chip kind="warn">効くが 12×1.25=15(Web の 20px ではない)</Chip>
          </View>
          <Label>{'+ style lineHeight: 12*1.4 = 16.8'}</Label>
          <View className="flex-row items-center gap-3">
            <Measured>
              <Text
                className="bg-yellow-200 text-[12px] text-black"
                style={{ lineHeight: 12 * 1.4 }}
              >
                あア gy
              </Text>
            </Measured>
            <Chip kind="ok">style 指定なら効く</Chip>
          </View>
          <Label>+ leading-6</Label>
          <View className="flex-row items-center gap-3">
            <Measured>
              <Text
                className="bg-yellow-200 text-[12px] leading-6 text-black"
                onLayout={(e) => {
                  // eslint-disable-next-line no-console
                  console.log('[probe] leading-6 h=', e.nativeEvent.layout.height)
                }}
              >
                あア gy
              </Text>
            </Measured>
            <Chip kind="warn">効くが 12×1.5=18(相対解決)</Chip>
          </View>
          <Label>{'+ leading-[16.8px](px の任意値)'}</Label>
          <View className="flex-row items-center gap-3">
            <Measured>
              <Text className="bg-yellow-200 text-[12px] leading-[16.8px] text-black">
                あア gy
              </Text>
            </Measured>
            <Chip kind="ng">px 明示の任意値でも無視される</Chip>
          </View>
          <Label>tracking-[0.28px](letterSpacing の className)</Label>
          <Text className="bg-yellow-200 text-[14px] tracking-[0.28px] text-black">
            字間テスト tracking
          </Text>
        </Section>

        <Section no="⑪" title="テキスト描画の OS 癖(iOS 下ズレ / Android 見切れ)">
          <Label>
            iOS: 固定高さ + 中央寄せ + lineHeight 指定で、実機では文字が 1〜1.5px 下にズレる(赤線
            = ボタンの縦中央。シミュレータではほぼ再現しない)
          </Label>
          <View className="relative self-start">
            <View className="flex-row gap-4">
              <View className="h-12 w-44 items-center justify-center bg-indigo-500">
                <Text className="text-[16px] text-white" style={{ lineHeight: 16 * 1.4 }}>
                  ボタン Aa
                </Text>
              </View>
              <View className="h-12 w-44 items-center justify-center bg-indigo-500">
                <Text className="text-[16px] text-white">ボタン Aa</Text>
              </View>
            </View>
            <View
              pointerEvents="none"
              className="absolute inset-x-0 top-[23px] h-[2px] bg-red-500/70"
            />
          </View>
          <View className="mt-1 flex-row gap-4">
            <View className="w-44">
              <Chip kind="warn">lineHeight 指定(実機で下ズレ)</Chip>
            </View>
            <View className="w-44">
              <Chip kind="ok">指定なし</Chip>
            </View>
          </View>
          <Label>
            h-6(21px)固定ラベルを py で内側から絞ると日本語下部が見切れる(すべて text-[12px])
          </Label>
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View className="h-6 flex-row items-center justify-center bg-emerald-600 px-3">
                <Text className="text-[12px] text-white">応募する</Text>
              </View>
              <Chip kind="ok">py なし: 内側 21dp</Chip>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="h-6 flex-row items-center justify-center bg-emerald-600 px-3 py-1">
                <Text className="text-[12px] text-white">応募する</Text>
              </View>
              <Chip kind="warn">py-1: 内側 14dp → Android のみ見切れ</Chip>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="h-6 flex-row items-center justify-center bg-emerald-600 px-3 py-2">
                <Text className="text-[12px] text-white">応募する</Text>
              </View>
              <Chip kind="ng">py-2: 内側 7dp → iOS でも見切れる</Chip>
            </View>
          </View>
        </Section>

        <Section no="⑫" title="影は 3 方式(ネイティブ影は overflow-hidden で消える)">
          <Label>同じ影スタイルの白カード。overflow-hidden を足しただけで iOS では影ごと消える</Label>
          <View className="flex-row flex-wrap gap-6 bg-gray-100 p-4">
            <View className="items-center gap-2">
              <View className="h-20 w-36 items-center justify-center rounded-[16px] bg-white shadow-lg">
                <Text className="text-[11px]">shadow-lg</Text>
              </View>
              <Chip kind="ok">shadow-* は boxShadow として効く</Chip>
            </View>
            <View className="items-center gap-2">
              <View className="h-20 w-36 items-center justify-center overflow-hidden rounded-[16px] bg-white shadow-lg">
                <Text className="text-[11px]">shadow-lg + overflow-hidden</Text>
              </View>
              <Chip kind="ok">overflow-hidden でも消えない</Chip>
            </View>
            <View className="items-center gap-2">
              <View
                className="h-20 w-36 items-center justify-center rounded-[16px] bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text className="text-[11px]">影のみ</Text>
              </View>
              <Chip kind="ok">影が出る</Chip>
            </View>
            <View className="items-center gap-2">
              <View
                className="h-20 w-36 items-center justify-center overflow-hidden rounded-[16px] bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text className="text-[11px]">+ overflow-hidden</Text>
              </View>
              <Chip kind="ng">iOS では影が消える</Chip>
            </View>
          </View>
        </Section>

        <Section no="⑬" title="gap は効く / space-x は無視される">
          <Label>gap-3</Label>
          <View className="items-start gap-1">
            <View className="flex-row gap-3">
              <Box className="h-8 w-16 bg-sky-500" label="A" />
              <Box className="h-8 w-16 bg-sky-600" label="B" />
            </View>
            <Chip kind="ok">隙間ができる</Chip>
          </View>
          <Label>space-x-3</Label>
          <View className="items-start gap-1">
            <View className="flex-row space-x-3">
              <Box className="h-8 w-16 bg-rose-400" label="A" />
              <Box className="h-8 w-16 bg-rose-500" label="B" />
            </View>
            <Chip kind="ng">無視される(密着したまま)</Chip>
          </View>
        </Section>

        <Section no="⑭" title="rem のベース値(w-4 = 1rem は何px?)">
          <Label>w-4(1rem)/ w-[14px] / w-[16px] の比較</Label>
          <Measured axis="width">
            <Box className="h-6 w-4 bg-fuchsia-600" label="" />
          </Measured>
          <Measured axis="width">
            <Box className="h-6 w-[14px] bg-gray-500" label="" />
          </Measured>
          <Measured axis="width">
            <Box className="h-6 w-[16px] bg-gray-700" label="" />
          </Measured>
          <Label>text-base(1rem)の行高実測(比較: text-[14px] / text-[16px])</Label>
          <View className="flex-row items-center gap-3">
            <Measured>
              <Text className="bg-yellow-200 text-base text-black">text-base</Text>
            </Measured>
            <Chip kind="warn">行高 1.5 込み → 14×1.5=21</Chip>
          </View>
          <Measured>
            <Text className="bg-yellow-200 text-[14px] text-black">text-[14px]</Text>
          </Measured>
          <Measured>
            <Text className="bg-yellow-200 text-[16px] text-black">text-[16px]</Text>
          </Measured>
        </Section>

        <Section no="⑮" title="dark: 片側指定 vs 両側指定">
          <Label>dark:text-white のみ(ライトモードでの表示が不定になりうる)</Label>
          <View className="bg-gray-200 p-1 dark:bg-gray-800">
            <Text className="dark:text-white">片側指定のテキスト</Text>
          </View>
          <Label>text-black dark:text-white(両側指定)</Label>
          <View className="bg-gray-200 p-1 dark:bg-gray-800">
            <Text className="text-black dark:text-white">両側指定のテキスト</Text>
          </View>
          <Label>色指定なし(dark:text-white の書き忘れ)</Label>
          <View className="bg-gray-200 p-1 dark:bg-gray-800">
            <Text>指定なしのテキスト(ダークで黒背景に黒文字になる)</Text>
          </View>
        </Section>

        <Section no="⑯" title="contentContainerClassName と style の併用">
          <Label>{'contentContainerClassName="gap-3 px-4" と contentContainerStyle を併用'}</Label>
          <View className="items-start gap-1">
            <ScrollView
              horizontal
              className="h-14 w-full bg-gray-100"
              contentContainerClassName="gap-3 px-4 items-center"
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              <Box className="h-8 w-20 bg-amber-500" label="A" />
              <Box className="h-8 w-20 bg-amber-600" label="B" />
              <Box className="h-8 w-20 bg-amber-700" label="C" />
            </ScrollView>
            <Chip kind="ng">className 側の gap / px が消えて密着する</Chip>
          </View>
          <Label>contentContainerStyle に一本化(同じ gap 12 / 横 padding 16)</Label>
          <View className="items-start gap-1">
            <ScrollView
              horizontal
              className="h-14 w-full bg-gray-100"
              contentContainerStyle={{
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 4,
                alignItems: 'center',
              }}
            >
              <Box className="h-8 w-20 bg-amber-500" label="A" />
              <Box className="h-8 w-20 bg-amber-600" label="B" />
              <Box className="h-8 w-20 bg-amber-700" label="C" />
            </ScrollView>
            <Chip kind="ok">意図どおり</Chip>
          </View>
        </Section>

        <Section no="⑰" title="グラデーションは className で作れる(experimental)">
          <Label>bg-indigo-100 + bg-linear-to-r from-indigo-500 to-pink-500</Label>
          <View className="items-start gap-1">
            <View className="h-8 w-full bg-indigo-100 bg-linear-to-r from-indigo-500 to-pink-500" />
            <Chip kind="ok">ネイティブでもグラデーションが描画される</Chip>
          </View>
        </Section>

        <Section no="⑱" title="プラットフォームバリアント">
          <Label>ios:text-blue-600 android:text-green-600</Label>
          <Text className="text-[14px] ios:text-blue-600 android:text-green-600">
            iOS なら青 / Android なら緑
          </Text>
        </Section>
      </ScrollView>
    </View>
  )
}
