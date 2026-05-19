import Skeleton from "react-loading-skeleton";

function AssignmentSkeleton() {

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] rounded-2xl p-6">

      <Skeleton
        height={30}
        width={220}
      />

      <div className="mt-4">

        <Skeleton
          height={20}
          width={140}
        />

      </div>

      <div className="mt-6 flex gap-3">

        <Skeleton
          height={35}
          width={100}
        />

        <Skeleton
          height={35}
          width={100}
        />

      </div>

    </div>
  );
}

export default AssignmentSkeleton;