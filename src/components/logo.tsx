import Svg, { G, Path, Rect } from 'react-native-svg';

/** The React App mark: two climbing chevrons and a red star on navy. */
export function Logo({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="React App">
      <Rect width={100} height={100} rx={22} fill="#152033" />
      <G fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={10}>
        <Path d="M26 86 L50 64 L74 86" stroke="#ffffff" strokeOpacity={0.55} />
        <Path d="M26 64 L50 42 L74 64" stroke="#ffffff" />
      </G>
      <Path
        transform="translate(10 5.2) scale(0.8)"
        d="M50 12 l4.4 9 9.9 1.4-7.2 7 1.7 9.8L50 34.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4z"
        fill="#e8261a"
      />
    </Svg>
  );
}
