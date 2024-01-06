"use client";
import { ChartPieIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import {
  inital_res,
  montOrderShort,
  monthOrder,
  today,
  todayString,
} from "../lib/utils";
import { z } from "zod";
import {
  amountSchema,
  budgetSchema,
  dateSchema,
  userSchema,
} from "../lib/validation-schemas";
import { useFormState } from "react-dom";
import {
  addEntry,
  changeBudgetName,
  deleteBudget,
  deleteEntries,
  inviteUserToBudget,
  removeContributor,
} from "../lib/action";
import { Purchace } from "../main/[budgetID]/page";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import clsx from "clsx";
import LeaveBudgetForm from "./leave-budget-form";

type Errors = {
  date?: string[] | undefined;
  store?: string[] | undefined;
  amount?: string[] | undefined;
};

export default function BudgetView({
  budget,
  entries,
  years,
  contributors,
  myID,
}: {
  budget: {
    id: string;
    name: string;
    ownerId: string;
    owner: {
      username: string;
    };
  };
  entries: Purchace[];
  years: number[];
  contributors: {
    id: string;
    username: string;
  }[];
  myID: string;
}) {
  //year slider
  const [selectedYear, setSelectedYear] = useState(
    years.length > 0 ? years[years.length - 1] : today.getFullYear(),
  );
  const [yearIndex, setYearIndex] = useState(0);
  const [yearWindowSize, setYearWindowSize] = useState(5);
  const [loadingSlider, setLoadingSlider] = useState(true);
  const changeSelectedYear = (year: number) => {
    setSelectedYear(year);
    const newDateAsArray = date.split("-");
    newDateAsArray[0] = year.toString();
    setDate(newDateAsArray.join("-"));
    setOpenMonth("");
  };

  //Month Accordion
  const [openMonth, setOpenMonth] = useState("");

  //Content filter & Month Extraction
  const yearFilterdContent = entries.filter(
    (entry) => entry.date.getFullYear() === selectedYear,
  );
  const months = [
    ...new Set(
      yearFilterdContent.map((entry) => monthOrder[entry.date.getMonth()]),
    ),
  ].sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a));
  const selectedContent = yearFilterdContent.filter(
    (entry) => monthOrder[entry.date.getMonth()] === openMonth,
  );

  //Year Slider & Delete
  useEffect(() => {
    //year slider
    if (years.length - yearIndex - 1 < years.indexOf(selectedYear)) {
      setSelectedYear(years[years.length - yearIndex - 1]);
      setOpenMonth("");
      setCheckBoxOn(false);
    } else if (
      years.length - yearWindowSize - yearIndex >
      years.indexOf(selectedYear)
    ) {
      setSelectedYear(years[years.length - yearWindowSize - yearIndex]);
      setOpenMonth("");
      setCheckBoxOn(false);
    }

    //reset on year delete
    if (!years.includes(selectedYear)) {
      setSelectedYear(
        years.length > 0 ? years[years.length - 1] : today.getFullYear(),
      );
      setDate(todayString);
      setOpenMonth("");
      setYearIndex(0);
    }
  }, [yearIndex, selectedYear, years, yearWindowSize]);

  //Scroll On Month Load
  const scrollContent = useRef(null);
  useEffect(() => {
    const scrollToElement = scrollContent.current;
    if (scrollToElement)
      (scrollToElement as HTMLParagraphElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    scrollContent.current = null;
    setLoadingSlider(false);
  }, []);

  //CheckBox
  const purcahseIDs = selectedContent.map((entry) => entry.id);
  const [checkBoxOn, setCheckBoxOn] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const allPurcahsesSelected =
    purcahseIDs.filter((id) => selectedPurchases.indexOf(id) > -1).length ===
    purcahseIDs.length;
  useEffect(() => {
    if (!checkBoxOn) setSelectedPurchases([]);
  }, [checkBoxOn]);

  //purcahse form
  const [date, setDate] = useState(todayString);
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const stores = [...new Set(entries.map((entry) => entry.store))];
  const [purchaseResponse, purchaseDispatch] = useFormState(
    addEntry.bind(null, budget.id),
    inital_res,
  );
  const [purcahseErrors, setPurcahseErrors] = useState<Errors>({});

  //Responsive Year Slider
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && yearWindowSize !== 5) setYearWindowSize(5);
      else if (window.innerWidth <= 768 && yearWindowSize !== 3)
        setYearWindowSize(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [yearWindowSize]);

  //onPurchaseSuccess
  useEffect(() => {
    if (purchaseResponse.success) {
      const [resYear, resMonth] = purchaseResponse.msg.split("-");
      if (
        years.length - yearWindowSize - yearIndex >
        years.indexOf(Number(resYear))
      )
        setYearIndex(
          years.length - yearWindowSize - years.indexOf(Number(resYear)),
        );
      else if (years.length - yearIndex - 1 < years.indexOf(Number(resYear)))
        setYearIndex(
          yearIndex -
            (years.indexOf(Number(resYear)) - (years.length - yearIndex - 1)),
        );
      setSelectedYear(Number(resYear));
      setOpenMonth(resMonth);
      setStore("");
      setAmount("");
      purchaseResponse.success = false;
      purchaseResponse.msg = "";
      document.querySelectorAll("input").forEach((input) => input.blur());
    }
  }, [purchaseResponse, years, yearIndex, yearWindowSize]);

  //Operations Accordion
  const [operationsAccordion, setOperationsAccordion] = useState<
    0 | 1 | 2 | 3 | 4
  >(0);

  //Invite Form
  const [inviteResponse, inviteDispatch] = useFormState(
    inviteUserToBudget.bind(null, budget.id),
    inital_res,
  );
  const [showInv, setShowInv] = useState(false);
  useEffect(() => {
    if (inviteResponse.success) {
      setShowInv(true);
      setTimeout(() => {
        setShowInv(false);
        inviteResponse.success = false;
        inviteResponse.msg = "";
      }, 3000);
    }
  }, [inviteResponse]);

  //budgetName Form
  const [budgetName, setBudgetName] = useState("");
  const [budgetNameErrors, setBudgetNameErrors] = useState<string[]>([]);
  const [budgetNameResponse, budgetNameDispatch] = useFormState(
    changeBudgetName.bind(null, budget.id),
    inital_res,
  );
  useEffect(() => {
    if (budgetNameResponse.success) {
      setOperationsAccordion(0);
      setBudgetName("");
      setBudgetNameErrors([]);
      budgetNameResponse.success = false;
      budgetNameResponse.msg = undefined;
    }
  }, [budgetNameResponse]);

  return (
    <>
      <div className="grow xl:overflow-y-auto">
        {/* Header */}
        <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
          <ChartPieIcon className="h-8 w-8" />
          <p>{budget.name}</p>
        </h1>

        {/* Mainpanel */}
        {years.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Year slider */}
            {loadingSlider ? (
              <p className="flex min-h-[40px] w-full items-center justify-center text-primary-500">
                Loading...
              </p>
            ) : (
              <div className="flex w-full items-center justify-evenly overscroll-none">
                {years.length > yearWindowSize ? (
                  <>
                    <ChevronLeftIcon
                      onClick={() =>
                        setYearIndex(
                          yearIndex < years.length - yearWindowSize
                            ? yearIndex + 1
                            : years.length - yearWindowSize,
                        )
                      }
                      className={`${
                        yearIndex === years.length - yearWindowSize
                          ? "pointer-events-none text-dark-300"
                          : ""
                      } h-6 w-6 cursor-pointer hover:text-primary-500`}
                    />
                    {years
                      .slice(
                        years.length - yearWindowSize - yearIndex,
                        years.length - yearIndex,
                      )
                      .map((year) => (
                        <p
                          onClick={() => changeSelectedYear(year)}
                          className={`cursor-pointer select-none px-6 py-2 hover:text-primary-600 ${
                            year === selectedYear ? "text-primary-500" : ""
                          }`}
                          key={year}
                        >
                          {year}
                        </p>
                      ))}
                    <ChevronRightIcon
                      onClick={() =>
                        setYearIndex(yearIndex > 0 ? yearIndex - 1 : 0)
                      }
                      className={`${
                        yearIndex === 0
                          ? "pointer-events-none text-dark-300"
                          : ""
                      } h-6 w-6 cursor-pointer hover:text-primary-500`}
                    />
                  </>
                ) : (
                  years.map((year) => (
                    <p
                      onClick={() => changeSelectedYear(year)}
                      className={`cursor-pointer px-6 py-2 hover:text-primary-600 ${
                        year === selectedYear ? "text-primary-500" : ""
                      }`}
                      key={year}
                    >
                      {year}
                    </p>
                  ))
                )}
              </div>
            )}

            {/* Year Content */}
            <div className="flex w-full flex-col md:p-8">
              {months.map((month: string) => (
                <div key={month}>
                  {/* Month Header */}
                  <div
                    className="mx-2 my-4 flex cursor-pointer select-none justify-between rounded border-2 border-primary-500 p-4 hover:bg-dark-200"
                    onClick={() => {
                      if (month === openMonth) setOpenMonth("");
                      else {
                        setOpenMonth(month);
                        const newDateAsArray = date.split("-");
                        newDateAsArray[1] = String(
                          monthOrder.indexOf(month) + 1,
                        ).padStart(2, "0");
                        setDate(newDateAsArray.join("-"));
                      }
                      setCheckBoxOn(false);
                    }}
                    key={month}
                  >
                    <p>{month}</p>
                    {month === openMonth ? (
                      <MinusIcon className="h-6 w-6" />
                    ) : (
                      <ChevronDownIcon className="h-6 w-6" />
                    )}
                  </div>

                  {/* Table */}
                  {month === openMonth ? (
                    <div
                      className={clsx(`mx-2 my-4 grid p-4 text-center`, {
                        "grid-cols-[7%_31%_31%_31%]": checkBoxOn,
                        "grid-cols-3": !checkBoxOn,
                      })}
                    >
                      {/* Table Header */}
                      <p
                        className={`p-4 text-primary-500 ${
                          checkBoxOn ? "col-start-2" : ""
                        }`}
                      >
                        Date
                      </p>
                      <p className="p-4 text-primary-500">Store</p>
                      <p className="p-4 text-primary-500">Amount</p>
                      {/* Table Body */}
                      {selectedContent.map(
                        ({ id, amount, date, store }, index) => (
                          <React.Fragment key={id}>
                            {checkBoxOn ? (
                              <div
                                className={`flex items-center justify-center rounded-bl-lg rounded-tl-lg ${
                                  index % 2 === 0 ? "bg-dark-200" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  id={`checkbox-${index}`}
                                  checked={selectedPurchases.includes(id)}
                                  className="h-5 w-5 rounded-2xl accent-primary-400"
                                  onChange={() => {
                                    if (selectedPurchases.includes(id))
                                      setSelectedPurchases(
                                        selectedPurchases.filter(
                                          (fidlerId) => fidlerId !== id,
                                        ),
                                      );
                                    else
                                      setSelectedPurchases([
                                        ...selectedPurchases,
                                        id,
                                      ]);
                                  }}
                                />
                              </div>
                            ) : (
                              <></>
                            )}
                            <p
                              key={id + 1}
                              className={`overflow-auto p-4 ${
                                checkBoxOn ? "" : "rounded-bl-lg rounded-tl-lg"
                              } ${index % 2 === 0 ? "bg-dark-200" : ""}`}
                            >
                              {`${String(date.getDate()).padStart(2, "0")} ${
                                montOrderShort[date.getMonth()]
                              }`}
                            </p>
                            <p
                              key={id + 2}
                              className={`overflow-auto p-4 ${
                                index % 2 === 0 ? "bg-dark-200" : ""
                              }`}
                            >
                              {store}
                            </p>
                            <p
                              key={id + 3}
                              className={`overflow-auto rounded-br-lg rounded-tr-lg p-4 ${
                                index % 2 === 0 ? "bg-dark-200" : ""
                              }`}
                            >
                              {amount.toFixed(2)}
                            </p>
                          </React.Fragment>
                        ),
                      )}
                      {/* Table tail */}
                      {checkBoxOn ? (
                        <>
                          <div
                            className={`flex items-center justify-center rounded-bl-lg rounded-tl-lg ${
                              selectedContent.length % 2 === 0
                                ? "bg-dark-200"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`checkbox-${selectedContent.length}`}
                              className="h-5 w-5 rounded-2xl accent-primary-400"
                              checked={allPurcahsesSelected}
                              onChange={() => {
                                if (allPurcahsesSelected)
                                  setSelectedPurchases([]);
                                else setSelectedPurchases([...purcahseIDs]);
                              }}
                            />
                          </div>
                          <div
                            className={`flex items-center justify-evenly space-x-4 ${
                              selectedContent.length % 2 === 0
                                ? "bg-dark-200"
                                : ""
                            }`}
                          >
                            <XMarkIcon
                              className="c h-8 w-8 cursor-pointer text-primary-500 hover:text-primary-600"
                              onClick={() => setCheckBoxOn(false)}
                            />
                            <div className="flex items-center justify-center space-x-2">
                              <TrashIcon
                                className={`h-8 w-8 ${
                                  selectedPurchases.length > 0
                                    ? "cursor-pointer text-primary-500 hover:text-red-500"
                                    : "text-dark-500"
                                }`}
                                onClick={() => {
                                  if (selectedPurchases.length > 0) {
                                    deleteEntries(budget.id, selectedPurchases);
                                    setCheckBoxOn(false);
                                  }
                                }}
                              />
                              <p className="select-none">
                                ({selectedPurchases.length})
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          className={`flex items-center justify-center rounded-bl-lg rounded-tl-lg ${
                            selectedContent.length % 2 === 0
                              ? "bg-dark-200"
                              : ""
                          }`}
                        >
                          <PencilIcon
                            className="c h-8 w-8 cursor-pointer text-primary-500 hover:text-primary-600"
                            onClick={() => setCheckBoxOn(true)}
                          />
                        </div>
                      )}
                      <p
                        className={`p-4 ${
                          selectedContent.length % 2 === 0 ? "bg-dark-200" : ""
                        }`}
                        ref={checkBoxOn ? null : scrollContent}
                      >
                        Total:
                      </p>
                      <p
                        className={`rounded-br-lg rounded-tr-lg p-4 ${
                          selectedContent.length % 2 === 0 ? "bg-dark-200" : ""
                        }`}
                      >
                        {selectedContent
                          .reduce((sum, entry) => sum + entry.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          //
          //
          // Empty Budget
          <p className="py-12 text-center text-2xl">
            <span className="text-primary-500">The budget is empty.</span>
            <br /> Add purchases to track your expenses over time.
          </p>
        )}
      </div>

      {/* Sidepanel */}
      <div className="flex flex-col md:flex-row xl:w-96 xl:flex-col xl:pt-24">
        {/* Purchase Form */}
        <form
          autoComplete="off"
          noValidate
          className="flex flex-col space-y-2 px-2 md:w-2/3 md:px-8 xl:w-full xl:space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              date: new Date(date),
              store,
              amount: Number(amount),
            };
            const parsedFields = z
              .object({
                date: dateSchema,
                store: userSchema,
                amount: amountSchema,
              })
              .safeParse(payload);
            if (parsedFields.success) purchaseDispatch(payload);
            else setPurcahseErrors(parsedFields.error.flatten().fieldErrors);
          }}
        >
          <h1 className="select-none text-center text-lg text-primary-500 md:text-xl">
            Add purchase
          </h1>
          {stores.length > 0 ? (
            <div
              id="storesDiv"
              className="flex min-h-[80px] w-full items-center justify-start space-x-4 overflow-x-auto overscroll-contain p-4"
              onWheel={(e) => {
                const storesDiv = document.querySelector("#storesDiv");
                if (storesDiv) storesDiv.scrollLeft += e.deltaY;
              }}
            >
              {stores.map((s) => (
                <p
                  className={`cursor-pointer rounded-full bg-dark-200 px-4 py-2 hover:bg-dark-300 ${
                    store === s ? "text-primary-500" : ""
                  }`}
                  key={s}
                  onClick={() => setStore(s)}
                >
                  {s}
                </p>
              ))}
            </div>
          ) : (
            <></>
          )}
          <Input
            autoComplete="off"
            label="Store"
            placeholder="store"
            id="store"
            name="store"
            type="text"
            required
            value={store}
            onChange={(e) => {
              const input = e.target.value.trim();
              if (purcahseErrors.store && userSchema.safeParse(input).success)
                purcahseErrors.store = undefined;
              setStore(input);
            }}
            errors={purcahseErrors.store}
          />

          <Input
            min={"2000-01-01"}
            max={todayString}
            className="pr-0"
            autoComplete="off"
            label="Date"
            id="date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => {
              const input = e.target.value;
              const newDate = new Date(input);
              if (dateSchema.safeParse(newDate).success) {
                if (purcahseErrors.date) purcahseErrors.date = undefined;
                if (years.includes(newDate.getFullYear())) {
                  if (
                    years.length - yearWindowSize - yearIndex >
                    years.indexOf(Number(newDate.getFullYear()))
                  )
                    setYearIndex(
                      years.length -
                        yearWindowSize -
                        years.indexOf(Number(newDate.getFullYear())),
                    );
                  else if (
                    years.length - yearIndex - 1 <
                    years.indexOf(Number(newDate.getFullYear()))
                  )
                    setYearIndex(
                      yearIndex -
                        (years.indexOf(Number(newDate.getFullYear())) -
                          (years.length - yearIndex - 1)),
                    );
                  setSelectedYear(newDate.getFullYear());
                }
                setOpenMonth(
                  months.includes(monthOrder[newDate.getMonth()])
                    ? monthOrder[newDate.getMonth()]
                    : "",
                );
                setCheckBoxOn(false);
              }
              setDate(input);
            }}
            errors={purcahseErrors.date}
          />

          <Input
            min={1}
            max={1000000}
            step={0.01}
            autoComplete="off"
            label="Amount"
            placeholder="0 - 999,999"
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            required
            value={amount === 0 ? "" : amount}
            onChange={(e) => {
              const input = e.target.value;
              if (/^[0-9]{0,7}(\.[0-9]{0,2})?$/.test(input)) {
                if (
                  purcahseErrors.amount &&
                  amountSchema.safeParse(Number(input)).success
                )
                  purcahseErrors.amount = undefined;
                setAmount(Number(input));
              }
            }}
            errors={purcahseErrors.amount}
          />
          <button className="btn">Submit</button>
        </form>

        {/* Operation Section */}
        {myID === budget.ownerId ? (
          //
          //
          // Owner Operations
          <div className="mt-8 flex flex-col px-2 md:w-1/2 md:justify-around md:px-8 xl:w-full">
            {/* Contributors List */}
            {contributors.length > 0 ? (
              <div
                className={`my-2 flex cursor-pointer select-none items-center justify-between rounded border border-primary-500 px-4 py-2 text-lg hover:bg-dark-200 md:text-xl ${
                  operationsAccordion === 1 ? "text-primary-500" : ""
                }`}
                onClick={() =>
                  setOperationsAccordion(operationsAccordion === 1 ? 0 : 1)
                }
              >
                <p>{`Contributors ${contributors.length} / 5`}</p>
                {operationsAccordion === 1 ? (
                  <MinusIcon className="h-6 w-6" />
                ) : (
                  <ChevronDownIcon className="h-6 w-6" />
                )}
              </div>
            ) : (
              <></>
            )}
            {operationsAccordion === 1 ? (
              <div className="my-2 space-y-4 px-4">
                {contributors.length > 0 ? (
                  <>
                    {contributors.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-around"
                      >
                        <p>{user.username}</p>
                        <form
                          action={async () =>
                            removeContributor(budget.id, user.id)
                          }
                        >
                          <button>
                            <TrashIcon className="h-5 w-5 cursor-pointer text-red-500 hover:text-primary-500" />
                          </button>
                        </form>
                      </div>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}

            {/* Contributor Form */}
            <div
              className={`my-2 flex cursor-pointer select-none items-center justify-between rounded border border-primary-500 px-4 py-2 text-lg hover:bg-dark-200 md:text-xl ${
                operationsAccordion === 2 ? "text-primary-500" : ""
              }`}
              onClick={() =>
                setOperationsAccordion(operationsAccordion === 2 ? 0 : 2)
              }
            >
              <p>Invite a user</p>
              {operationsAccordion === 2 ? (
                <MinusIcon className="h-6 w-6" />
              ) : (
                <ChevronDownIcon className="h-6 w-6" />
              )}
            </div>
            {operationsAccordion === 2 ? (
              <form
                action={inviteDispatch}
                autoComplete="off"
                noValidate
                className="my-2 px-4"
              >
                {!showInv ? (
                  <Input
                    autoComplete="off"
                    placeholder="user@example.com"
                    label="Email or Username"
                    name="identifier"
                    id="identifier"
                    errors={
                      inviteResponse.msg && !inviteResponse.success
                        ? [inviteResponse.msg]
                        : []
                    }
                    required
                  />
                ) : (
                  <p className="text-center">
                    An invite was sent to{" "}
                    <span className="text-primary-500">
                      {inviteResponse.msg}
                    </span>
                  </p>
                )}
              </form>
            ) : (
              <></>
            )}

            {/* Delete Budget */}
            <div
              className={`my-2 flex cursor-pointer select-none items-center justify-between rounded border border-primary-500 px-4 py-2 text-lg hover:bg-dark-200 md:text-xl ${
                operationsAccordion === 3 ? "text-primary-500" : ""
              }`}
              onClick={() =>
                setOperationsAccordion(operationsAccordion === 3 ? 0 : 3)
              }
            >
              <p>Delete budget</p>
              {operationsAccordion === 3 ? (
                <MinusIcon className="h-6 w-6" />
              ) : (
                <ChevronDownIcon className="h-6 w-6" />
              )}
            </div>
            {operationsAccordion === 3 ? (
              <div className="my-2 flex w-full justify-around px-4 text-lg md:justify-between md:text-xl">
                <p className="text-primary-500">Are you sure?</p>
                <form
                  action={deleteBudget.bind(null, budget.id)}
                  className="flex"
                >
                  <button>
                    <TrashIcon className="h-8 w-8 text-primary-500 hover:text-red-500" />
                  </button>
                </form>
              </div>
            ) : (
              <></>
            )}

            {/* Change Budget Name */}
            <div
              className={`my-2 flex cursor-pointer select-none items-center justify-between rounded border border-primary-500 px-4 py-2 text-lg hover:bg-dark-200 md:text-xl ${
                operationsAccordion === 4 ? "text-primary-500" : ""
              }`}
              onClick={() =>
                setOperationsAccordion(operationsAccordion === 4 ? 0 : 4)
              }
            >
              <p>Change budget name</p>
              {operationsAccordion === 4 ? (
                <MinusIcon className="h-6 w-6" />
              ) : (
                <ChevronDownIcon className="h-6 w-6" />
              )}
            </div>
            {operationsAccordion === 4 ? (
              <form
                autoComplete="off"
                action={() => {
                  const parsedInput = budgetSchema.safeParse(budgetName.trim());
                  if (parsedInput.success)
                    budgetNameDispatch(budgetName.trim());
                  else
                    setBudgetNameErrors(parsedInput.error.flatten().formErrors);
                }}
                noValidate
                className="my-2 px-4"
              >
                <Input
                  autoComplete="off"
                  placeholder="Budget name"
                  errors={
                    budgetNameResponse.msg
                      ? [...budgetNameErrors, budgetNameResponse.msg]
                      : budgetNameErrors
                  }
                  value={budgetName}
                  label="New name"
                  id="budget"
                  type="text"
                  required
                  divClass="min-h-[95px]"
                  onChange={(e) => {
                    const inputText = e.target.value;
                    if (
                      budgetNameErrors.length > 0 &&
                      budgetSchema.safeParse(inputText.trim()).success
                    )
                      setBudgetNameErrors([]);
                    setBudgetName(inputText);
                  }}
                />
              </form>
            ) : (
              <></>
            )}
          </div>
        ) : (
          //
          //
          // Contributor Operations
          <div className="mt-8 flex flex-col px-2 text-lg md:w-1/2 md:justify-around md:px-8 md:text-xl xl:w-full">
            <h1 className="my-8 flex select-none items-center justify-between ">
              <span className="text-primary-500">Budget owner :</span>
              <span>{budget.owner.username}</span>
            </h1>
            <LeaveBudgetForm budgetID={budget.id} />
          </div>
        )}
      </div>
    </>
  );
}
