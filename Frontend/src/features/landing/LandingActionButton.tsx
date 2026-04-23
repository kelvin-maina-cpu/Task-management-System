import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import './landingButton.css';

type BaseProps = {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

type LinkProps = BaseProps & {
  to: string;
  onClick?: never;
  type?: never;
};

type NativeButtonProps = BaseProps &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type' | 'disabled'> & {
    to?: never;
  };

type LandingActionButtonProps = LinkProps | NativeButtonProps;

const isLinkProps = (props: LandingActionButtonProps): props is LinkProps => typeof props.to === 'string';

const sizeClasses = {
  sm: 'landing-orbit-button--sm',
  md: 'landing-orbit-button--md',
  lg: 'landing-orbit-button--lg',
};

const content = (children: ReactNode) => (
  <>
    <span className="landing-orbit-button__svgs" aria-hidden="true">
      <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="landing-orbit-button__svg landing-orbit-button__svg--large">
        <path d="M240 128a15.79 15.79 0 0 1-10.5 15l-63.44 23.07L143 229.5a16 16 0 0 1-30 0l-23.06-63.44L26.5 143a16 16 0 0 1 0-30l63.44-23.06L113 26.5a16 16 0 0 1 30 0l23.07 63.44L229.5 113a15.79 15.79 0 0 1 10.5 15" />
      </svg>
      <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="landing-orbit-button__svg landing-orbit-button__svg--small">
        <path d="M240 128a15.79 15.79 0 0 1-10.5 15l-63.44 23.07L143 229.5a16 16 0 0 1-30 0l-23.06-63.44L26.5 143a16 16 0 0 1 0-30l63.44-23.06L113 26.5a16 16 0 0 1 30 0l23.07 63.44L229.5 113a15.79 15.79 0 0 1 10.5 15" />
      </svg>
    </span>
    <span>{children}</span>
  </>
);

export const LandingActionButton = (props: LandingActionButtonProps) => {
  const { children, className, size = 'md' } = props;
  const buttonClassName = clsx('landing-orbit-button', sizeClasses[size], className);

  if (isLinkProps(props)) {
    const { to } = props;

    return (
      <Link to={to} className={buttonClassName}>
        <span className="landing-orbit-button__inner">{content(children)}</span>
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={buttonClassName}
    >
      <span className="landing-orbit-button__inner">{content(children)}</span>
    </button>
  );
};
