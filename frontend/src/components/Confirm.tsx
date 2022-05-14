import { Dialog, Transition } from '@headlessui/react';
import { ExclamationIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import React, { Fragment, useRef } from 'react';

import { Button } from './buttons';

type Style = 'warning' | 'danger';

interface Props {
  isOpen: boolean;
  close: () => void;
  onClick: () => void;

  title: string;
  description: string;

  truthy?: string;
  falsy?: string;

  style?: Style;
}

const Confirm = ({
  isOpen,
  close,
  onClick,
  title,
  description,
  truthy = 'Yes',
  falsy = 'Nevermind',
  style = 'danger',
}: Props): JSX.Element => {
  const cancelRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelRef} onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div
                      className={classNames(
                        { 'bg-red-100': style === 'danger', 'bg-yellow-100': style === 'warning' },
                        'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                      )}
                    >
                      <ExclamationIcon
                        className={classNames(
                          { 'text-red-600': style === 'danger', 'text-yellow-600': style === 'warning' },
                          'h-6 w-6',
                        )}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="button"
                    style={style}
                    onClick={() => {
                      onClick();
                      close();
                    }}
                    className="w-full inline-flex justify-center sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {truthy}
                  </Button>
                  <Button
                    type="button"
                    style="secondary"
                    onClick={close}
                    ref={cancelRef}
                    className="mt-3 w-full inline-flex justify-center sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {falsy}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Confirm;
